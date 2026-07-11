// src/features/auth/authService.ts
// Authentication service. Identity is established in Supabase first, then the
// user/team/team_member rows are mirrored into local SQLite for offline use.

import type { Session } from '@supabase/supabase-js';
import { getSupabase, getSupabaseInitError } from '@config/supabase';
import { getDatabase } from '@db/database';
import { log } from '@shared/utils/logging';
import { generateId, nowISO, validateEmail, validateRequired } from '@shared/utils/helpers';
import type { User, ServiceResponse } from '@shared/types/database';
import type { AuthPayload } from './authTypes';

const MODULE = 'AUTH';

interface UserRow {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  preferred_units: 'imperial' | 'metric';
  created_at: string;
  updated_at: string;
}

function fail<T>(error: string, data: T): ServiceResponse<T> {
  return { success: false, data, error };
}

function ok<T>(data: T): ServiceResponse<T> {
  return { success: true, data };
}

function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    fullName: row.full_name,
    preferredUnits: row.preferred_units,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function upsertUser(user: User): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO users
       (id, email, phone, full_name, preferred_units, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      user.id,
      user.email,
      user.phone,
      user.fullName,
      user.preferredUnits,
      user.createdAt,
      user.updatedAt,
    ]
  );
}

async function readUserById(id: string): Promise<User | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
  return row ? mapUserRow(row) : null;
}

async function readTeamIdForUser(userId: string): Promise<string | null> {
  const db = await getDatabase();
  const member = await db.getFirstAsync<{ team_id: string }>(
    'SELECT team_id FROM team_members WHERE user_id = ? LIMIT 1',
    [userId]
  );
  if (member) {
    return member.team_id;
  }
  const owned = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM teams WHERE owner_id = ? LIMIT 1',
    [userId]
  );
  return owned?.id ?? null;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<ServiceResponse<AuthPayload | null>> {
  log.info(MODULE, 'sign_up_start');
  try {
    const initError = getSupabaseInitError();
    if (initError) {
      return fail(initError, null);
    }

    const nameCheck = validateRequired(fullName, 'Full name');
    if (!nameCheck.isValid) {
      return fail(nameCheck.error ?? 'Invalid name.', null);
    }
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return fail(emailCheck.error ?? 'Invalid email.', null);
    }
    if (password.length < 6) {
      return fail('Password must be at least 6 characters.', null);
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      log.error(MODULE, 'sign_up_supabase_error', error);
      return fail(error.message, null);
    }
    if (!data.user) {
      return fail('Sign up failed: no user returned.', null);
    }
    if (!data.session) {
      return fail(
        'Account created. Please confirm your email, then sign in.',
        null
      );
    }

    const now = nowISO();
    const user: User = {
      id: data.user.id,
      email: data.user.email ?? email,
      phone: null,
      fullName,
      preferredUnits: 'imperial',
      createdAt: now,
      updatedAt: now,
    };
    const teamId = generateId();
    const memberId = generateId();

    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT OR REPLACE INTO users
           (id, email, phone, full_name, preferred_units, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.id, user.email, user.phone, user.fullName, user.preferredUnits, now, now]
      );
      await db.runAsync(
        `INSERT OR REPLACE INTO teams (id, name, owner_id, created_at)
         VALUES (?, ?, ?, ?)`,
        [teamId, `${fullName}'s Team`, user.id, now]
      );
      await db.runAsync(
        `INSERT OR REPLACE INTO team_members
           (id, team_id, user_id, role, visible_barn_ids,
            can_edit_records, can_view_invoices, can_create_invoices, created_at)
         VALUES (?, ?, ?, 'owner', NULL, 1, 1, 1, ?)`,
        [memberId, teamId, user.id, now]
      );
    });

    log.info(MODULE, 'sign_up_success', { userId: user.id, teamId });
    return ok({ session: data.session, user, teamId });
  } catch (error) {
    log.error(MODULE, 'sign_up_failed', error);
    return fail('Sign up failed. Please try again.', null);
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<ServiceResponse<AuthPayload | null>> {
  log.info(MODULE, 'sign_in_start');
  try {
    const initError = getSupabaseInitError();
    if (initError) {
      return fail(initError, null);
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return fail(emailCheck.error ?? 'Invalid email.', null);
    }
    if (!password) {
      return fail('Password is required.', null);
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      log.error(MODULE, 'sign_in_supabase_error', error);
      return fail(error.message, null);
    }
    if (!data.session || !data.user) {
      return fail('Sign in failed: no session returned.', null);
    }

    const now = nowISO();
    const existing = await readUserById(data.user.id);
    const metadataName =
      (data.user.user_metadata?.full_name as string | undefined) ?? null;

    const user: User = existing ?? {
      id: data.user.id,
      email: data.user.email ?? email,
      phone: null,
      fullName: metadataName ?? (data.user.email ?? email),
      preferredUnits: 'imperial',
      createdAt: now,
      updatedAt: now,
    };
    await upsertUser(user);

    const teamId = await readTeamIdForUser(user.id);
    if (!teamId) {
      return fail('No team found for this account on this device.', null);
    }

    log.info(MODULE, 'sign_in_success', { userId: user.id, teamId });
    return ok({ session: data.session, user, teamId });
  } catch (error) {
    log.error(MODULE, 'sign_in_failed', error);
    return fail('Sign in failed. Please try again.', null);
  }
}

export async function signOut(): Promise<ServiceResponse<null>> {
  log.info(MODULE, 'sign_out_start');
  try {
    const initError = getSupabaseInitError();
    if (initError) {
      return fail(initError, null);
    }
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) {
      log.error(MODULE, 'sign_out_supabase_error', error);
      return fail(error.message, null);
    }
    log.info(MODULE, 'sign_out_success');
    return ok(null);
  } catch (error) {
    log.error(MODULE, 'sign_out_failed', error);
    return fail('Sign out failed. Please try again.', null);
  }
}

export async function getCurrentSession(): Promise<ServiceResponse<AuthPayload | null>> {
  try {
    const initError = getSupabaseInitError();
    if (initError) {
      return fail(initError, null);
    }
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      log.error(MODULE, 'get_session_error', error);
      return fail(error.message, null);
    }

    const session: Session | null = data.session;
    if (!session) {
      return ok(null);
    }

    const now = nowISO();
    const existing = await readUserById(session.user.id);
    const metadataName =
      (session.user.user_metadata?.full_name as string | undefined) ?? null;

    const user: User = existing ?? {
      id: session.user.id,
      email: session.user.email ?? null,
      phone: null,
      fullName: metadataName ?? (session.user.email ?? 'Farrier'),
      preferredUnits: 'imperial',
      createdAt: now,
      updatedAt: now,
    };

    const teamId = await readTeamIdForUser(session.user.id);
    if (!teamId) {
      // Session exists but local team is missing — treat as unauthenticated
      // so the user is routed back to sign-in on this device.
      return ok(null);
    }

    return ok({ session, user, teamId });
  } catch (error) {
    log.error(MODULE, 'get_session_failed', error);
    return fail('Could not restore session.', null);
  }
}

// src/features/auth/authTypes.ts
// Auth-domain types. Re-exports core entities and defines the auth state shape.

import type { Session } from '@supabase/supabase-js';

export type { User, Team, TeamMember } from '@shared/types/database';

import type { User } from '@shared/types/database';

export interface AuthState {
  user: User | null;
  teamId: string | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthPayload {
  session: Session;
  user: User;
  teamId: string;
}

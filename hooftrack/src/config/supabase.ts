// src/config/supabase.ts
// Lazy-initialized Supabase client. Env-var failure surfaces a structured
// error to AuthProvider instead of crashing the bundle at module load.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

let client: SupabaseClient | null = null;
let initError: string | null = null;

function initializeSupabase(): SupabaseClient | null {
  if (client) return client;
  if (initError) return null;

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    initError = 'Missing Supabase environment variables. Copy .env.example to .env and fill in your credentials.';
    return null;
  }

  client = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

export function getSupabase(): SupabaseClient {
  const c = initializeSupabase();
  if (!c) {
    throw new Error(initError ?? 'Supabase client unavailable.');
  }
  return c;
}

export function getSupabaseInitError(): string | null {
  initializeSupabase();
  return initError;
}

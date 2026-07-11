// src/features/auth/AuthProvider.tsx
// React Context that exposes auth state and actions. Restores any existing
// session on mount and reacts to Supabase auth changes (e.g. sign-out).

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { getSupabase } from '@config/supabase';
import { log } from '@shared/utils/logging';
import { COLORS } from '@shared/constants/theme';
import type { ServiceResponse } from '@shared/types/database';
import {
  getCurrentSession,
  signInWithEmail,
  signOut as signOutService,
  signUpWithEmail,
} from './authService';
import type { AuthPayload, AuthState } from './authTypes';

const INITIAL_STATE: AuthState = {
  user: null,
  teamId: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
};

const READY_TIMEOUT_MS = 1000;

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<ServiceResponse<AuthPayload | null>>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<ServiceResponse<AuthPayload | null>>;
  signOut: () => Promise<ServiceResponse<null>>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function authenticatedState(payload: AuthPayload): AuthState {
  return {
    user: payload.user,
    teamId: payload.teamId,
    session: payload.session,
    isLoading: false,
    isAuthenticated: true,
  };
}

function signedOutState(): AuthState {
  return { ...INITIAL_STATE, isLoading: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const isReadyRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    function markReady(next: AuthState) {
      isReadyRef.current = true;
      if (isMounted) {
        setState(next);
      }
    }

    async function restore() {
      const result = await getCurrentSession();
      if (result.success && result.data) {
        markReady(authenticatedState(result.data));
      } else {
        markReady(signedOutState());
      }
    }

    restore();

    const timeout = setTimeout(() => {
      if (!isReadyRef.current && isMounted) {
        log.warn('AUTH', 'session_restore_timeout');
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }, READY_TIMEOUT_MS);

    let unsubscribe: (() => void) | undefined;
    try {
      const supabase = getSupabase();
      const { data } = supabase.auth.onAuthStateChange((event) => {
        log.info('AUTH', 'auth_state_change', { event });
        if (event === 'SIGNED_OUT' && isMounted) {
          setState(signedOutState());
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch (error) {
      log.error('AUTH', 'auth_listener_failed', error);
    }

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      unsubscribe?.();
    };
  }, []);

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const result = await signInWithEmail(email, password);
    if (result.success && result.data) {
      setState(authenticatedState(result.data));
    }
    return result;
  };

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName) => {
    const result = await signUpWithEmail(email, password, fullName);
    if (result.success && result.data) {
      setState(authenticatedState(result.data));
    }
    return result;
  };

  const signOut: AuthContextValue['signOut'] = async () => {
    const result = await signOutService();
    if (result.success) {
      setState(signedOutState());
    }
    return result;
  };

  if (state.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
});

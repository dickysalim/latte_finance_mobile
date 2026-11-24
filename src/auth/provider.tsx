import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ApiError, getMe, logout as apiLogout, refreshSession, restoreSession, setSessionEndedListener, type Me } from '@/api';

/**
 * loading: reading the stored session
 * offline: a stored session exists but the server could not be reached (tokens kept)
 * signedOut: show the login screen
 * profile / household: logged in, one setup step left
 * ready: setup done
 */
export type AuthStatus = 'loading' | 'offline' | 'signedOut' | 'profile' | 'household' | 'ready';

type AuthContextValue = {
  status: AuthStatus;
  me: Me | null;
  /** Read /me again and move to the step it asks for. Call after login, profile and household steps. */
  reload: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Retry the stored session after an offline start. */
  retry: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function statusFor(me: Me): AuthStatus {
  if (me.profile_needed) return 'profile';
  if (me.household_needed) return 'household';
  return 'ready';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [me, setMe] = useState<Me | null>(null);

  const reload = useCallback(async () => {
    const next = await getMe();
    setMe(next);
    setStatus(statusFor(next));
  }, []);

  const start = useCallback(async () => {
    if (!(await restoreSession())) {
      setStatus('signedOut');
      return;
    }
    try {
      await refreshSession();
      await reload();
    } catch (error) {
      // 401 already ended the session through the listener. 429 and network errors keep the tokens.
      if (error instanceof ApiError && (error.status === 401 || error.code === 'account_deactivated')) return;
      setStatus('offline');
    }
  }, [reload]);

  useEffect(() => {
    setSessionEndedListener(() => {
      setMe(null);
      setStatus('signedOut');
    });
    // Reads the stored session (external system) once at startup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void start();
    return () => setSessionEndedListener(null);
  }, [start]);

  const signOut = useCallback(async () => {
    await apiLogout();
    setMe(null);
    setStatus('signedOut');
  }, []);

  const retry = useCallback(async () => {
    setStatus('loading');
    await start();
  }, [start]);

  const value = useMemo(() => ({ status, me, reload, signOut, retry }), [status, me, reload, signOut, retry]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

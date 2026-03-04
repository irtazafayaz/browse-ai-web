'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, googleAuth as apiGoogleAuth, getMe, tokens } from '@/lib/api';

/* ── Types ── */
export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, password2: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  googleAuth: (accessToken: string) => Promise<void>;
}

/* ── Context ── */
const AuthContext = createContext<AuthContextValue | null>(null);

/* ── getMe with a hard timeout so app never hangs on slow backend ── */
const GET_ME_TIMEOUT_MS = 8_000;
async function getMeWithTimeout(): Promise<AuthUser | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), GET_ME_TIMEOUT_MS);
    getMe()
      .then(u => resolve(u ?? null))
      .catch(() => resolve(null))
      .finally(() => clearTimeout(timer));
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session if tokens exist. If the backend says the user
  // is gone (returns null) we clear tokens so they don't accumulate stale data.
  useEffect(() => {
    if (tokens.access) {
      getMeWithTimeout().then(u => {
        if (u) {
          setUser(u);
        } else {
          // Token exists but backend rejected it or user was deleted
          tokens.clear();
          setUser(null);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, password2: string, firstName = '', lastName = '') => {
    const data = await apiRegister(email, password, password2, firstName, lastName);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    // Clear user state immediately — apiLogout is fire-and-forget
    setUser(null);
    await apiLogout();
  }, []);

  const googleAuth = useCallback(async (accessToken: string) => {
    const data = await apiGoogleAuth(accessToken);
    setUser(data.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

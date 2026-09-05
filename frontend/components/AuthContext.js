'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'ms_token';
const USER_KEY = 'ms_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // refresh profile in background
      api('/auth/me', { token: storedToken })
        .then((data) => {
          const u = data.user;
          setUser(u);
          localStorage.setItem(USER_KEY, JSON.stringify(u));
        })
        .catch(() => {
          // ignore transient failures; keep cached user
        });
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const register = useCallback(
    async (payload) => {
      const data = await api('/auth/register', { method: 'POST', body: payload });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const logout = useCallback(async () => {
    const t = token || localStorage.getItem(TOKEN_KEY);
    try {
      if (t) await api('/auth/logout', { method: 'POST', token: t });
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    router.push('/');
  }, [token, router]);

  const updateUser = useCallback((u) => {
    setUser(u);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { authenticatedFetch } from '@/lib/api';

type AppUser = { uid: string; email: string | null; displayName: string | null };

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

function AuthBridge({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const user = useMemo<AppUser | null>(() => {
    if (!session?.user?.id) return null;
    return {
      uid: session.user.id,
      email: session.user.email ?? null,
      displayName: session.user.name ?? null,
    };
  }, [session?.user?.id, session?.user?.email, session?.user?.name]);

  useEffect(() => {
    if (!user || status !== 'authenticated') return;
    void authenticatedFetch('/api/users/sync', { method: 'POST' })
      .then((response) => {
        if (!response.ok) console.warn('Unable to sync authenticated user profile');
      })
      .catch(() => console.warn('Unable to sync authenticated user profile'));
  }, [user, status]);

  return (
    <AuthContext.Provider value={{ user, loading: status === 'loading' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus>
      <AuthBridge>{children}</AuthBridge>
    </SessionProvider>
  );
}

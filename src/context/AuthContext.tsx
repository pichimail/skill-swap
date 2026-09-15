'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '@/lib/api';
import { auth } from '@/lib/firebase';

type AppUser = { uid: string; email: string | null; displayName: string | null };

const DEMO_ENABLED = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === 'true';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isDemo: boolean;
  demoEnabled: boolean;
  loginDemo: () => void;
  logoutDemo: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemo: false,
  demoEnabled: false,
  loginDemo: () => {},
  logoutDemo: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    if (DEMO_ENABLED && localStorage.getItem('skill_swap_demo_user') === 'true') {
      setUser({ uid: 'demo-user', email: 'demo@skillswap.local', displayName: 'Demo User' });
      setIsDemo(true);
      setLoading(false);
      return () => { mounted = false; };
    }

    localStorage.removeItem('skill_swap_demo_user');

    if (!auth) {
      setLoading(false);
      return () => { mounted = false; };
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!mounted) return;
      setUser(currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
      } : null);
      setIsDemo(false);
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const loginDemo = () => {
    if (!DEMO_ENABLED) throw new Error('Demo authentication is disabled');
    localStorage.setItem('skill_swap_demo_user', 'true');
    setUser({ uid: 'demo-user', email: 'demo@skillswap.local', displayName: 'Demo User' });
    setIsDemo(true);
    router.push('/dashboard');
  };

  const logoutDemo = () => {
    localStorage.removeItem('skill_swap_demo_user');
    setUser(null);
    setIsDemo(false);
    router.push('/');
  };

  useEffect(() => {
    if (!user || isDemo) return;

    void authenticatedFetch('/api/users/sync', { method: 'POST' })
      .then((response) => {
        if (!response.ok) console.warn('Unable to sync authenticated user profile');
      })
      .catch(() => console.warn('Unable to sync authenticated user profile'));
  }, [user, isDemo]);

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, demoEnabled: DEMO_ENABLED, loginDemo, logoutDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: { uid: string; email: string | null; displayName: string | null } | null;
  loading: boolean;
  isDemo: boolean;
  loginDemo: () => void;
  logoutDemo: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isDemo: false, loginDemo: () => {}, logoutDemo: () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ uid: string; email: string | null; displayName: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const demoStatus = localStorage.getItem('skill_swap_demo_user');
    if (demoStatus === 'true') {
      if (isMounted) {
        setUser({ uid: 'demo-user', email: 'demo@skillswap.com', displayName: 'Gnanu Raavi' });
        setIsDemo(true);
        setLoading(false);
      }
      return;
    }

    if (!auth) {
      if (isMounted) setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (isMounted) {
        setUser(currentUser ? { uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName } : null);
        setIsDemo(false);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const loginDemo = () => {
    localStorage.setItem('skill_swap_demo_user', 'true');
    setUser({ uid: 'demo-user', email: 'demo@skillswap.com', displayName: 'Gnanu Raavi' });
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
    if (!user) return;

    void fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
      }),
    }).catch((error) => {
      console.warn('Unable to sync user profile to Neon:', error);
    });
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, isDemo, loginDemo, logoutDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

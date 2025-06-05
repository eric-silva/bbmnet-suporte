'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ALLOWED_DOMAINS, MOCK_USER } from '@/lib/constants';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface Session {
  user: SessionUser | null;
  status: 'authenticated' | 'unauthenticated' | 'loading';
}

interface SessionContextType {
  session: Session;
  signIn: () => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function AppProviders({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ user: null, status: 'loading' });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking session storage or an auth token
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user && user.email && ALLOWED_DOMAINS.some(domain => user.email.endsWith('@' + domain))) {
        setSession({ user, status: 'authenticated' });
      } else {
        localStorage.removeItem('mockUser'); // Invalid user
        setSession({ user: null, status: 'unauthenticated' });
      }
    } else {
      setSession({ user: null, status: 'unauthenticated' });
    }
  }, []);

  useEffect(() => {
    if (session.status === 'unauthenticated' && pathname !== '/') {
      router.push('/');
    } else if (session.status === 'authenticated' && pathname === '/') {
      router.push('/dashboard');
    }
  }, [session.status, pathname, router]);


  const signIn = () => {
    // Simulate Microsoft login flow
    // For mock, we'll use a predefined MOCK_USER if their domain is allowed
    const userDomain = MOCK_USER.email?.split('@')[1];
    if (MOCK_USER.email && userDomain && ALLOWED_DOMAINS.includes(userDomain)) {
      localStorage.setItem('mockUser', JSON.stringify(MOCK_USER));
      setSession({ user: MOCK_USER, status: 'authenticated' });
      router.push('/dashboard');
    } else {
      alert(`Mock user's email domain (${userDomain}) is not allowed. Please check MOCK_USER in constants.ts and ensure its domain is in ALLOWED_DOMAINS.`);
      setSession({ user: null, status: 'unauthenticated' });
    }
  };

  const signOut = () => {
    localStorage.removeItem('mockUser');
    setSession({ user: null, status: 'unauthenticated' });
    router.push('/');
  };

  if (session.status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

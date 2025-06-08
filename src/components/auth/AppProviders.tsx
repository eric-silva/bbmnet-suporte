
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LifeBuoy } from 'lucide-react';
// MOCK_CUSTOM_USER_CREDENTIALS and MOCK_CUSTOM_USER_SESSION_DATA are removed from constants

interface SessionUser {
  name?: string | null;
  email?: string | null;
  id?: string | null;
}

interface Session {
  user: SessionUser | null;
  status: 'authenticated' | 'unauthenticated' | 'loading';
  error?: string | null; // For login errors
}

interface SessionContextType {
  session: Session;
  signIn: (email?: string, password?: string) => Promise<{ success: boolean, error?: string }>;
  signOut: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const AuthManager: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session>({ user: null, status: 'loading' });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUserString = localStorage.getItem('mockUserSession');
    if (storedUserString) {
      try {
        const parsedUser = JSON.parse(storedUserString);
        setSession({ user: parsedUser, status: 'authenticated' });
      } catch (e) {
        localStorage.removeItem('mockUserSession');
        setSession({ user: null, status: 'unauthenticated' });
      }
    } else {
      setSession({ user: null, status: 'unauthenticated' });
    }
  }, []);

  useEffect(() => {
    if (session.status === 'unauthenticated' && pathname !== '/' && !pathname.startsWith('/api/auth')) {
      router.push('/');
    } else if (session.status === 'authenticated' && pathname === '/') {
      router.push('/tickets');
    }
  }, [session.status, pathname, router]);

  const signIn = async (email?: string, password?: string): Promise<{ success: boolean, error?: string }> => {
    setSession(prev => ({ ...prev, status: 'loading', error: null }));
    
    if (!email || !password) {
        const errorMsg = "E-mail e senha são obrigatórios.";
        setSession({ user: null, status: 'unauthenticated', error: errorMsg });
        return { success: false, error: errorMsg };
    }

    try {
      const response = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Password sent but ignored by mock API
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || `Falha no login (status: ${response.status})`;
        setSession({ user: null, status: 'unauthenticated', error: errorMsg });
        localStorage.removeItem('mockUserSession');
        return { success: false, error: errorMsg };
      }
      
      // data should be { id, name, email } from the API
      const userToStore: SessionUser = {
        id: data.id,
        name: data.name,
        email: data.email,
      };
      localStorage.setItem('mockUserSession', JSON.stringify(userToStore));
      setSession({ user: userToStore, status: 'authenticated' });
      return { success: true };

    } catch (error) {
      console.error("Sign in error:", error);
      const errorMsg = "Ocorreu um erro de rede ou inesperado durante o login.";
      setSession({ user: null, status: 'unauthenticated', error: errorMsg });
      localStorage.removeItem('mockUserSession');
      return { success: false, error: errorMsg };
    }
  };

  const signOut = async () => {
    setSession(prev => ({ ...prev, status: 'loading', error: null }));
    await new Promise(resolve => setTimeout(resolve, 300)); 
    localStorage.removeItem('mockUserSession');
    setSession({ user: null, status: 'unauthenticated' });
    router.push('/'); 
  };

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const storedUserString = localStorage.getItem('mockUserSession');
    if (storedUserString) {
      try {
        const parsedUser = JSON.parse(storedUserString) as SessionUser;
        if (parsedUser.email) {
          // For middleware and backend API calls to identify the user
          return { 'X-Authenticated-User-Email': parsedUser.email };
        }
      } catch (e) {
        // Ignore error, return empty headers
      }
    }
    return {};
  }, []);


  if (session.status === 'loading' && pathname !== '/') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
        <LifeBuoy className="h-16 w-16 text-primary mb-6 animate-pulse" />
        <p className="text-xl text-foreground">Carregando sessão...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, signIn, signOut, getAuthHeaders }}>
      {children}
    </SessionContext.Provider>
  );
};

export function AppProviders({ children }: { children: ReactNode }) {
  return <AuthManager>{children}</AuthManager>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within an AppProviders');
  }
  return context;
}

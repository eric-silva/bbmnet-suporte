
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LifeBuoy } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader'; // Import AppHeader
import { sha1Convert } from '@/lib/utils';

interface SessionUser {
  id: string;
  name?: string | null;
  email: string;
  fotoUrl?: string | null; // Added fotoUrl
}

interface Session {
  user: SessionUser | null;
  token: string | null;
  status: 'authenticated' | 'unauthenticated' | 'loading';
  error?: string | null;
}

interface SessionContextType {
  session: Session;
  signIn: (email?: string, password?: string) => Promise<{ success: boolean, error?: string }>;
  signOut: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const AuthManager: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session>({ user: null, token: null, status: 'loading' });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUserString = localStorage.getItem('sessionUser');
    const storedToken = localStorage.getItem('sessionToken');
    if (storedUserString && storedToken) {
      try {
        const parsedUser: SessionUser = JSON.parse(storedUserString);
        setSession({ user: parsedUser, token: storedToken, status: 'authenticated' });
      } catch (e) {
        localStorage.removeItem('sessionUser');
        localStorage.removeItem('sessionToken');
        setSession({ user: null, token: null, status: 'unauthenticated' });
      }
    } else {
      setSession({ user: null, token: null, status: 'unauthenticated' });
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
        setSession({ user: null, token: null, status: 'unauthenticated', error: errorMsg });
        return { success: false, error: errorMsg };
    }

    try {
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || `Falha no login (status: ${response.status})`;
        setSession({ user: null, token: null, status: 'unauthenticated', error: errorMsg });
        localStorage.removeItem('sessionUser');
        localStorage.removeItem('sessionToken');
        return { success: false, error: errorMsg };
      }

      if (!data || typeof data !== 'object' || !data.user || !data.token) {
        const errorMsg = "Resposta inválida do servidor de autenticação.";
        setSession({ user: null, token: null, status: 'unauthenticated', error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const { user: loggedInUser, token: sessionToken } = data;

      if (!loggedInUser || !sessionToken || !loggedInUser.id || !loggedInUser.email) {
        const errorMsg = "Resposta inválida do servidor de autenticação.";
        setSession({ user: null, token: null, status: 'unauthenticated', error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const userToStore: SessionUser = {
        id: loggedInUser.id,
        name: loggedInUser.nome,
        email: loggedInUser.email,
        fotoUrl: loggedInUser.fotoUrl, // Store fotoUrl
      };
      localStorage.setItem('sessionUser', JSON.stringify(userToStore));
      localStorage.setItem('sessionToken', sessionToken);
      setSession({ user: userToStore, token: sessionToken, status: 'authenticated' });
      return { success: true };

    } catch (error) {
      console.error("Sign in error:", error);
      const errorMsg = "Ocorreu um erro de rede ou inesperado durante o login.";
      setSession({ user: null, token: null, status: 'unauthenticated', error: errorMsg });
      localStorage.removeItem('sessionUser');
      localStorage.removeItem('sessionToken');
      return { success: false, error: errorMsg };
    }
  };

  const signOut = async () => {
    setSession(prev => ({ ...prev, status: 'loading', error: null }));
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.removeItem('sessionUser');
    localStorage.removeItem('sessionToken');
    setSession({ user: null, token: null, status: 'unauthenticated' });
    router.push('/');
  };

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const storedToken = localStorage.getItem('sessionToken');
    const storedUserString = localStorage.getItem('sessionUser');
    let headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
    // User details are now set by middleware based on token, but client can still send for initial context if needed
    if (storedUserString) {
        try {
            const user: SessionUser = JSON.parse(storedUserString);
            if(user.email) headers['X-Authenticated-User-Email'] = user.email; // Retained for now, middleware is primary
        } catch (e) {
            console.warn("Could not parse sessionUser from localStorage in getAuthHeaders");
        }
    }
    return headers;
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
      {session.status === 'authenticated' && <AppHeader />}
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
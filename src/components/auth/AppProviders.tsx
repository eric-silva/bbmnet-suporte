
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { EventType, InteractionType, InteractionRequiredAuthError, type AccountInfo } from '@azure/msal-browser';
import { msalInstance, loginRequest } from '@/lib/auth';
import { LifeBuoy } from 'lucide-react';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  id?: string | null; 
}

interface Session {
  user: SessionUser | null;
  status: 'authenticated' | 'unauthenticated' | 'loading';
  error?: string | null;
}

interface SessionContextType {
  session: Session;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  acquireToken: () => Promise<string | null>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const AuthManager: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const [session, setSession] = useState<Session>({ user: null, status: 'loading' });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const callbackId = instance.addEventCallback((event: any) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
        instance.setActiveAccount(event.payload.account);
      }
      if (event.eventType === EventType.LOGIN_FAILURE) {
        console.error("Login failure:", event.error);
        setSession({ user: null, status: 'unauthenticated', error: event.error?.errorMessage || 'Login failed' });
      }
    });

    instance.handleRedirectPromise().catch(err => {
      console.error("Redirect promise error:", err);
      setSession({ user: null, status: 'unauthenticated', error: err.errorMessage || 'Login handling failed' });
    });
    
    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance]);

  useEffect(() => {
    const activeAccount = instance.getActiveAccount();

    if (inProgress === 'none') {
      if (activeAccount) {
        setSession({
          user: {
            name: activeAccount.name || (activeAccount.idTokenClaims?.name as string) || null,
            email: activeAccount.username,
            id: activeAccount.localAccountId,
          },
          status: 'authenticated',
        });
      } else {
        setSession({ user: null, status: 'unauthenticated' });
      }
    } else {
      setSession(prev => ({ ...prev, status: 'loading' }));
    }
  }, [inProgress, accounts, instance]);

  useEffect(() => {
    if (session.status === 'unauthenticated' && pathname !== '/' && inProgress === 'none') {
      router.push('/');
    } else if (session.status === 'authenticated' && pathname === '/' && inProgress === 'none') {
      router.push('/dashboard');
    }
  }, [session.status, pathname, router, inProgress]);

  const signIn = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login error:', error);
      setSession({ user: null, status: 'unauthenticated', error: (error as Error).message || 'Login failed' });
    }
  };

  const signOut = async () => {
    try {
      const activeAccount = instance.getActiveAccount();
      const postLogoutRedirectUri = process.env.NEXT_PUBLIC_AZURE_AD_POST_LOGOUT_REDIRECT_URI || '/';
      if (activeAccount) {
        await instance.logoutRedirect({ account: activeAccount, postLogoutRedirectUri });
      } else {
        await instance.logoutRedirect({ postLogoutRedirectUri });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Você pode definir um estado de erro aqui, se necessário
    }
  };

  const acquireToken = async (): Promise<string | null> => {
    const activeAccount = instance.getActiveAccount();
    if (!activeAccount) {
      // Tentar login se não houver conta ativa? Ou apenas retornar nulo?
      // Por enquanto, apenas retornamos nulo. Pode-se chamar signIn() aqui se necessário.
      // signIn(); 
      return null;
    }
    const request = {
      ...loginRequest,
      account: activeAccount,
    };
    try {
      const response = await instance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          // Fallback para interação quando a chamada silenciosa falha
          const response = await instance.acquireTokenRedirect(request);
          return response.accessToken;
        } catch (redirectError) {
          console.error('Redirect token acquisition error:', redirectError);
          setSession(prev => ({ ...prev, error: (redirectError as Error).message || 'Token acquisition failed' }));
          return null;
        }
      }
      console.error('Token acquisition error:', error);
      setSession(prev => ({ ...prev, error: (error as Error).message || 'Token acquisition failed' }));
      return null;
    }
  };
  
  // Estado de carregamento inicial enquanto MSAL se estabelece ou um login/logout está em andamento
  if (inProgress !== 'none' && (inProgress === 'startup' || inProgress === 'handleRedirect' || inProgress.startsWith('login') || inProgress.startsWith('logout'))) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
        <LifeBuoy className="h-16 w-16 text-primary mb-6 animate-pulse" />
        <p className="text-xl text-foreground">Processando autenticação...</p>
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, signIn, signOut, acquireToken }}>
      {children}
    </SessionContext.Provider>
  );
};

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthManager>{children}</AuthManager>
    </MsalProvider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within an AppProviders');
  }
  return context;
}


'use client';

import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';
import { useSession } from './AppProviders';
import { useState } from 'react';

export function SignInButton() {
  const { signIn, session } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
      // O redirecionamento será tratado pelo MSAL e AppProviders
    } catch (error) {
      console.error("Sign in failed", error);
      setIsSigningIn(false); 
      // Adicionar tratamento de erro visual para o usuário, se necessário
    }
    // Não defina setIsSigningIn(false) aqui se o loginRedirect for bem-sucedido,
    // pois a página será recarregada.
  };

  const isLoading = isSigningIn || session.status === 'loading';

  return (
    <Button onClick={handleSignIn} size="lg" className="font-headline" disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <LogIn className="mr-2 h-5 w-5" />
      )}
      Entrar com Microsoft
    </Button>
  );
}

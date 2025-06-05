'use client';

import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useSession } from './AppProviders';

export function SignInButton() {
  const { signIn } = useSession();

  return (
    <Button onClick={() => signIn()} size="lg" className="font-headline">
      <LogIn className="mr-2 h-5 w-5" />
      Sign in with Microsoft
    </Button>
  );
}

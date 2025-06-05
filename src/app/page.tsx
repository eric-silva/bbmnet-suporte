'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/auth/AppProviders';
import { SignInButton } from '@/components/auth/SignInButton';
import { Ticket } from 'lucide-react';

export default function HomePage() {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [session.status, router]);

  if (session.status === 'loading' || session.status === 'authenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
        <Ticket className="h-16 w-16 text-primary mb-6 animate-pulse" />
        <p className="text-xl text-foreground">Loading application...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
      <div className="max-w-md w-full text-center bg-card p-8 rounded-xl shadow-2xl">
        <Ticket className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4 font-headline text-primary">
          BBMNET Support Tracker
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Please sign in to manage support tickets.
        </p>
        <SignInButton />
        <p className="mt-6 text-xs text-muted-foreground">
          Access restricted to authorized domains.
        </p>
      </div>
       <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BBMNET. All rights reserved.
        </footer>
    </div>
  );
}

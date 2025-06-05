
'use client';
import { AppHeader } from '@/components/layout/AppHeader';
import { useSession } from '@/components/auth/AppProviders';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === 'unauthenticated') {
      router.push('/');
    }
  }, [session.status, router]);

  if (session.status === 'loading' || session.status === 'unauthenticated') {
    return (
       <div className="flex h-screen items-center justify-center">
        <p>Carregando sessão...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Construído por Sua Equipe. Desenvolvido com Next.js e ShadCN UI.
          </p>
        </div>
      </footer>
    </div>
  );
}


'use client';
import { AppHeader } from '@/components/layout/AppHeader';
import { useSession } from '@/components/auth/AppProviders';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LifeBuoy } from 'lucide-react';

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

  if (session.status === 'loading') {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
        <LifeBuoy className="h-16 w-16 text-primary mb-6 animate-pulse" />
        <p className="text-xl text-foreground">Carregando sessão...</p>
      </div>
    );
  }
  
  if (session.status === 'unauthenticated') {
    // AppProviders já deve ter redirecionado.
    // Mas como uma segurança, podemos mostrar algo ou forçar o redirecionamento.
    return (
       <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary">
        <LifeBuoy className="h-16 w-16 text-primary mb-6" />
        <p className="text-xl text-foreground">Redirecionando para o login...</p>
      </div>
    );
  }

  // session.status === 'authenticated'
  return (
    <div className="flex min-h-screen flex-col">
      <div className="app-header-print-hide">
        <AppHeader />
      </div>
      <main className="flex-1">
        {children}
      </main>
      <footer className={cn("py-6 md:px-8 md:py-0 bg-background border-t", "app-footer-print-hide")}>
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Construído por Sua Equipe. Desenvolvido com Next.js e ShadCN UI.
          </p>
        </div>
      </footer>
    </div>
  );
}

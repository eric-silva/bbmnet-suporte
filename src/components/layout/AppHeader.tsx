
'use client';
import Link from 'next/link';
import { UserNav } from '@/components/auth/UserNav';
import { Button } from '@/components/ui/button';
import { LifeBuoy, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import { MegaMenu } from './MegaMenu';

export function AppHeader() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* A classe 'container' adiciona padding responsivo e max-width, lidando com as margens */}
        <div className="container flex h-16 items-center">
          {/* Logo e Nome do App - alinhado à esquerda */}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <LifeBuoy className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline sm:inline-block text-lg">
              BBMNET Suporte
            </span>
          </Link>
          
          {/* Acionador do Mega Menu - centralizado */}
          {/* 'flex-grow' faz este div ocupar o espaço disponível, empurrando UserNav para a direita */}
          {/* 'justify-center' centraliza o botão dentro deste div */}
          <div className="flex-grow flex justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMegaMenuOpen(true)}
              aria-label="Abrir menu principal"
              className="h-10 w-10 text-primary hover:bg-primary/10"
            >
              <LayoutGrid className="h-6 w-6" />
            </Button>
          </div>

          {/* Navegação do Usuário - alinhada à direita */}
          {/* Removido justify-end e space-x-4 pois UserNav é o único filho direto aqui e sua posição é determinada pelo flex-grow do elemento central */}
          <div className="flex items-center">
            <UserNav />
          </div>
        </div>
      </header>
      <MegaMenu isOpen={isMegaMenuOpen} onOpenChange={setIsMegaMenuOpen} />
    </>
  );
}

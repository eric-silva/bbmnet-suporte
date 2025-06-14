
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
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <LifeBuoy className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline sm:inline-block text-lg">
              BBMNET Suporte
            </span>
          </Link>
          
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

          <div className="flex items-center justify-end space-x-4">
            <UserNav />
          </div>
        </div>
      </header>
      <MegaMenu isOpen={isMegaMenuOpen} onOpenChange={setIsMegaMenuOpen} />
    </>
  );
}

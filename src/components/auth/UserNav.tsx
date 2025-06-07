
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, UserCircle, Loader2 } from 'lucide-react';
import { useSession } from './AppProviders';
import { useState } from 'react';

export function UserNav() {
  const { session, signOut } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    // O AppProviders cuidará do redirecionamento.
  };

  if (session.status === 'loading') {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  if (session.status !== 'authenticated' || !session.user) {
    return null; // Ou um botão de login, dependendo do design
  }

  const { name, email } = session.user;
  const image = null; // Placeholder, imagem do usuário não está no mock simples
  const fallbackName = name ? name.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : <UserCircle />);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border">
            {image && <AvatarImage src={image} alt={name || email || 'Avatar do usuário'} />}
            <AvatarFallback>{fallbackName}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {name && <p className="text-sm font-medium leading-none font-headline">{name}</p>}
            {email && <p className="text-xs leading-none text-muted-foreground">{email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/* Adicionar outros itens como Perfil, Configurações se necessário */}
        </DropdownMenuGroup>
        <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
          {isSigningOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

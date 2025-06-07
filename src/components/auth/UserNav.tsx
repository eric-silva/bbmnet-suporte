
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
    // O MSAL cuidará do redirecionamento.
    // Não é necessário definir setIsSigningOut(false) aqui.
  };

  if (session.status !== 'authenticated' || !session.user) {
    // Poderia retornar um Skeleton aqui se session.status === 'loading'
    return null;
  }

  const { name, email } = session.user;
  // MSAL geralmente não fornece uma URL de imagem diretamente no objeto da conta.
  // Se você precisar de uma imagem, precisaria buscá-la via Microsoft Graph API usando um token de acesso.
  // Por enquanto, vamos usar um fallback.
  const image = null; // Substitua se você implementar o carregamento de imagem do Graph
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


'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle, 
  DialogTrigger,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; 
import { UsuarioForm } from './UsuarioForm';
import type { UsuarioFormData, Usuario } from '@/types';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/components/auth/AppProviders';

interface CreateUsuarioButtonProps {
  onUsuarioCreated?: () => void; 
}

export function CreateUsuarioButton({ onUsuarioCreated }: CreateUsuarioButtonProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { getAuthHeaders } = useSession(); 

  const handleSubmit = async (formData: UsuarioFormData) => { 
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(), 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessages = errorData.errors 
          ? Object.values(errorData.errors).flat().join('\\n') 
          : errorData.message;
        throw new Error(errorMessages || `HTTP error! status: ${response.status}`);
      }
      
      const newUsuario: Usuario = await response.json();
      toast({
        title: "Usuário Criado",
        description: `O usuário ${newUsuario.nome} foi criado com sucesso.`,
        variant: 'default',
      });
      setOpen(false);
      onUsuarioCreated?.(); 
      return { success: true, usuario: newUsuario };
    } catch (error: any) {
      console.error("Erro ao Criar Usuário:", error);
      toast({
        title: "Erro ao Criar Usuário",
        description: error.message || 'Falha ao conectar com o servidor.',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-headline">
          <PlusCircle className="mr-2 h-5 w-5" />
          Criar Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </VisuallyHidden>
        <UsuarioForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          formMode="create"
        />
      </DialogContent>
    </Dialog>
  );
}

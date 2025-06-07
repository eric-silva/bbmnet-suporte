
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
import { TicketForm } from './TicketForm';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/components/auth/AppProviders'; // Import useSession
import type { Ticket } from '@/types';

interface CreateTicketButtonProps {
  onTicketCreated?: () => void; // Callback to refresh ticket list
}

export function CreateTicketButton({ onTicketCreated }: CreateTicketButtonProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { getAuthHeaders } = useSession(); // Get auth headers hook

  const handleSubmit = async (formData: FormData) => {
    const objectData: Record<string, any> = {};
    formData.forEach((value, key) => { objectData[key] = value; });
    
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(), // Add auth headers
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(objectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.errors ? JSON.stringify(errorData.errors) : `HTTP error! status: ${response.status}`);
      }
      
      const newTicket: Ticket = await response.json();
      toast({
        title: "Ticket Criado",
        description: `O ticket ${newTicket.id} foi criado com sucesso.`,
        variant: 'default',
      });
      setOpen(false);
      onTicketCreated?.(); // Call the callback to refresh data
      return { success: true, ticket: newTicket };
    } catch (error: any) {
      console.error("Erro ao Criar Ticket:", error);
      let description = 'Ocorreu um erro desconhecido.';
      try {
        // Attempt to parse field errors if they exist
        const parsedError = JSON.parse(error.message);
        description = Object.values(parsedError).flat().join('\n');
      } catch (e) {
        // If parsing fails, use the original error message
        description = error.message || 'Falha ao conectar com o servidor.';
      }

      toast({
        title: "Erro ao Criar Ticket",
        description: description,
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
          Criar Novo Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>Criar Novo Ticket</DialogTitle>
        </VisuallyHidden>
        <TicketForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          formMode="create"
        />
      </DialogContent>
    </Dialog>
  );
}


'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle, // Import DialogTitle
  DialogTrigger,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Import VisuallyHidden
import { TicketForm, type TicketFormData } from './TicketForm';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/components/auth/AppProviders';
import type { Ticket } from '@/types';

interface CreateTicketButtonProps {
  onTicketCreated?: () => void; 
}

export function CreateTicketButton({ onTicketCreated }: CreateTicketButtonProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { getAuthHeaders } = useSession(); 

  const handleSubmit = async (formData: TicketFormData) => { // formData is now TicketFormData
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(), 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Send TicketFormData directly
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessages = errorData.errors 
          ? Object.values(errorData.errors).flat().join('\n') 
          : errorData.message;
        throw new Error(errorMessages || `HTTP error! status: ${response.status}`);
      }
      
      const newTicket: Ticket = await response.json();
      toast({
        title: "Ticket Criado",
        description: `O ticket ${newTicket.id} foi criado com sucesso.`,
        variant: 'default',
      });
      setOpen(false);
      onTicketCreated?.(); 
      return { success: true, ticket: newTicket };
    } catch (error: any) {
      console.error("Erro ao Criar Ticket:", error);
      toast({
        title: "Erro ao Criar Ticket",
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

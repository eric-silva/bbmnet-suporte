
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle, // Added DialogTitle import
  DialogTrigger,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Added VisuallyHidden import
import { TicketForm } from './TicketForm';
import { createTicketAction } from '@/app/actions/tickets';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CreateTicketButton() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    const result = await createTicketAction(formData);
    if (result.success) {
      toast({
        title: "Ticket Criado",
        description: `O ticket ${result.ticket?.id} foi criado com sucesso.`,
        variant: 'default',
      });
      setOpen(false);
      // Consider revalidating path or refetching tickets on the dashboard page
      // For example, if you pass a callback: `onTicketCreated?.()`
    } else {
      const errorMessages = result.error ?
        typeof result.error === 'string' ? result.error :
        Object.values(result.error).flat().join('\n')
        : 'Ocorreu um erro desconhecido.';
      toast({
        title: "Erro ao Criar Ticket",
        description: errorMessages,
        variant: 'destructive',
      });
    }
    return result; // Always return result to ensure the form can handle it
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

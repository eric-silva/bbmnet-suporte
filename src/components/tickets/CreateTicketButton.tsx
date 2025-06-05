
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
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
      setOpen(false); 
    }
    return result;
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
        <TicketForm 
          onSubmit={handleSubmit} 
          onCancel={() => setOpen(false)} 
          formMode="create" 
        />
      </DialogContent>
    </Dialog>
  );
}

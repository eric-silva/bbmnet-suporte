
'use client';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { TicketDataTable } from '@/components/tickets/TicketDataTable';
import { getTicketColumns } from '@/components/tickets/TicketColumns';
import { CreateTicketButton } from '@/components/tickets/CreateTicketButton';
import type { Ticket } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useSession } from '@/components/auth/AppProviders';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import { TicketForm } from '@/components/tickets/TicketForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BarChart2 } from 'lucide-react';

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { toast } = useToast();
  const { getAuthHeaders } = useSession();

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tickets', {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedTickets: Ticket[] = await response.json();
      setTickets(fetchedTickets);
    } catch (error) {
      console.error("Falha ao buscar tickets:", error);
      toast({
        title: "Erro ao buscar tickets",
        description: "Não foi possível carregar os dados dos tickets. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, getAuthHeaders]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);


  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsEditModalOpen(true);
  };

  const handleUpdateTicket = async (formData: FormData, ticketId: string) => {
    if (!ticketId) return { success: false, error: 'Nenhum ticket selecionado para atualização.' };
    
    const objectData: Record<string, any> = {};
    formData.forEach((value, key) => { objectData[key] = value; });

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(objectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const updatedTicket = await response.json();
      setIsEditModalOpen(false);
      setSelectedTicket(null);
      fetchTickets(); // Refetch tickets to update the list
      return { success: true, ticket: updatedTicket };
    } catch (error: any) {
      console.error("Falha ao atualizar ticket:", error);
      return { success: false, error: error.message || 'Falha ao conectar com o servidor.' };
    }
  };
  
  const columns = React.useMemo(() => getTicketColumns(handleEdit), []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-headline text-foreground">Tickets de Suporte</h1>
        <div className="flex items-center gap-2">
          <CreateTicketButton onTicketCreated={fetchTickets} />
          <Link href="/dashboard/charts" passHref>
            <Button variant="outline" size="icon" aria-label="Ver gráficos">
              <BarChart2 className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      <TicketDataTable columns={columns} data={tickets} />

      {selectedTicket && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <VisuallyHidden>
              <DialogTitle>Editar Ticket</DialogTitle>
            </VisuallyHidden>
            <TicketForm
              ticket={selectedTicket}
              // onSubmit expects FormData and ticket ID for PUT
              onSubmit={(formData) => handleUpdateTicket(formData, selectedTicket.id)}
              onCancel={() => setIsEditModalOpen(false)}
              formMode="edit"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

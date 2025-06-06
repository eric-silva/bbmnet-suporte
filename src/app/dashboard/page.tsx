
'use client';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TicketDataTable } from '@/components/tickets/TicketDataTable';
import { getTicketColumns } from '@/components/tickets/TicketColumns';
import { CreateTicketButton } from '@/components/tickets/CreateTicketButton';
import { getTickets, updateTicketAction } from '@/app/actions/tickets';
import type { Ticket } from '@/types';
import { useToast } from "@/hooks/use-toast";
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

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const fetchedTickets = await getTickets();
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
  };

  useEffect(() => {
    fetchTickets();
  }, []);


  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsEditModalOpen(true);
  };

  const handleUpdateTicket = async (formData: FormData) => {
    if (!selectedTicket) return { success: false, error: 'Nenhum ticket selecionado para atualização.' };
    const result = await updateTicketAction(selectedTicket.id, formData);
    if (result.success) {
      setIsEditModalOpen(false);
      setSelectedTicket(null);
      fetchTickets(); 
    }
    return result;
  };
  
  const columns = React.useMemo(() => getTicketColumns(handleEdit), [handleEdit]);

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
          <CreateTicketButton />
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
              onSubmit={handleUpdateTicket}
              onCancel={() => setIsEditModalOpen(false)}
              formMode="edit"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

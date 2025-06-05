
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Ticket, Priority, TicketStatus, TicketType, Assignee, Environment, Origin } from '@/types';
import { priorities, ticketStatuses, ticketTypes, environments, origins } from '@/types';
import { 
  getTicketsStore, 
  addTicketToStore, 
  updateTicketInStore, 
  findTicketById,
  generateTicketId
} from '@/lib/store';
import { PERMITTED_ASSIGNEES, MOCK_USER } from '@/lib/constants';

const TicketSchema = z.object({
  problemDescription: z.string().min(10, 'A descrição do problema deve ter pelo menos 10 caracteres.'),
  priority: z.enum(priorities),
  type: z.enum(ticketTypes),
  responsavelEmail: z.string().email({ message: "E-mail inválido." }).nullable().or(z.literal('')),
  status: z.enum(ticketStatuses).optional(), // Obrigatório na edição, opcional na criação (default 'Para fazer')
  resolutionDetails: z.string().optional(),
  evidencias: z.string().min(1, 'O campo Evidências é obrigatório.'),
  anexos: z.string().optional(),
  ambiente: z.enum(environments),
  origem: z.enum(origins),
  // Campos de data como createdAt, inicioAtendimento, terminoAtendimento são gerenciados pelo servidor.
});

export async function getTickets(): Promise<Ticket[]> {
  return JSON.parse(JSON.stringify(getTicketsStore()));
}

export async function getTicket(id: string): Promise<Ticket | undefined> {
  return JSON.parse(JSON.stringify(findTicketById(id)));
}

export async function createTicketAction(formData: FormData) {
  const solicitanteEmail = MOCK_USER.email;
  const solicitanteName = MOCK_USER.name;

  if (!solicitanteEmail || !solicitanteName) {
    return { success: false, error: 'Usuário não autenticado' };
  }

  const parsed = TicketSchema.safeParse({
    problemDescription: formData.get('problemDescription'),
    priority: formData.get('priority'),
    type: formData.get('type'),
    responsavelEmail: formData.get('responsavelEmail') || null, // Será nulo ou string vazia inicialmente
    evidencias: formData.get('evidencias'),
    anexos: formData.get('anexos') || undefined,
    ambiente: formData.get('ambiente'),
    origem: formData.get('origem'),
    // status é definido abaixo
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const now = new Date().toISOString();

  const newTicket: Ticket = {
    id: generateTicketId(),
    ...data,
    solicitanteEmail,
    solicitanteName,
    responsavelEmail: data.responsavelEmail === '' ? null : data.responsavelEmail, // Garante null se vazio
    status: 'Para fazer', // Default status for new tickets
    createdAt: now,
    updatedAt: now,
    inicioAtendimento: null,
    terminoAtendimento: null,
    // resolutionDetails é opcional e já está em data
  };

  addTicketToStore(newTicket);
  // TODO: Implementar notificação Discord aqui
  // e.g., sendDiscordNotification(newTicket);

  revalidatePath('/dashboard');
  return { success: true, ticket: newTicket };
}

export async function updateTicketAction(id: string, formData: FormData) {
  const existingTicket = findTicketById(id);
  if (!existingTicket) {
    return { success: false, error: 'Ticket não encontrado' };
  }

  const previousStatus = existingTicket.status;

  // Para atualização, o status é obrigatório
  const UpdateTicketSchema = TicketSchema.extend({
     status: z.enum(ticketStatuses),
  });

  const parsed = UpdateTicketSchema.safeParse({
    problemDescription: formData.get('problemDescription'),
    priority: formData.get('priority'),
    type: formData.get('type'),
    responsavelEmail: formData.get('responsavelEmail') || null,
    status: formData.get('status'),
    resolutionDetails: formData.get('resolutionDetails') || undefined,
    evidencias: formData.get('evidencias'),
    anexos: formData.get('anexos') || undefined,
    ambiente: formData.get('ambiente'),
    origem: formData.get('origem'),
  });
  
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }
  
  const data = parsed.data;
  const now = new Date().toISOString();

  let inicioAtendimento = existingTicket.inicioAtendimento;
  if (previousStatus === 'Para fazer' && data.status === 'Em Andamento' && !existingTicket.inicioAtendimento) {
    inicioAtendimento = now;
  }

  let terminoAtendimento = existingTicket.terminoAtendimento;
  if (data.status === 'Finalizado' && previousStatus !== 'Finalizado') {
    terminoAtendimento = now;
  } else if (previousStatus === 'Finalizado' && data.status !== 'Finalizado') {
    terminoAtendimento = null; // Limpa se não está mais finalizado
  }


  const updatedTicketData: Partial<Ticket> = {
    ...data,
    responsavelEmail: data.responsavelEmail === '' ? null : data.responsavelEmail,
    updatedAt: now,
    inicioAtendimento,
    terminoAtendimento,
  };

  // Filtra campos opcionais indefinidos
  if (data.resolutionDetails === undefined) delete updatedTicketData.resolutionDetails;
  if (data.anexos === undefined) delete updatedTicketData.anexos;


  const success = updateTicketInStore({ ...existingTicket, ...updatedTicketData });

  if (success) {
    revalidatePath('/dashboard');
    revalidatePath(`/tickets/${id}`); 
    return { success: true, ticket: { ...existingTicket, ...updatedTicketData } as Ticket };
  }
  
  return { success: false, error: 'Falha ao atualizar ticket' };
}


export async function getPermittedAssignees(): Promise<Assignee[]> {
  // Em um app real, isso viria de um diretório de usuários ou banco de dados
  return PERMITTED_ASSIGNEES.filter(assignee => 
    assignee.email.endsWith('@pitang.com') || assignee.email.endsWith('@novobbmnet.com.br') || assignee.email.endsWith('@example.com') // example.com para teste
  );
}

export async function getEnvironments(): Promise<Environment[]> {
  return [...environments];
}

export async function getOrigins(): Promise<Origin[]> {
  return [...origins];
}

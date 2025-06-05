'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Ticket, Priority, TicketStatus, TicketType, Assignee } from '@/types';
import { priorities, ticketStatuses, ticketTypes } from '@/types';
import { 
  getTicketsStore, 
  addTicketToStore, 
  updateTicketInStore, 
  findTicketById,
  generateTicketId
} from '@/lib/store';
import { PERMITTED_ASSIGNEES, MOCK_USER } from '@/lib/constants'; // MOCK_USER for solicitante

const TicketSchema = z.object({
  problemDescription: z.string().min(10, 'Problem description must be at least 10 characters.'),
  priority: z.enum(priorities),
  type: z.enum(ticketTypes),
  responsavelEmail: z.string().email().nullable(),
  status: z.enum(ticketStatuses).optional(),
  resolutionDetails: z.string().optional(),
});

export async function getTickets(): Promise<Ticket[]> {
  // In a real app, this would fetch from a database
  return JSON.parse(JSON.stringify(getTicketsStore())); // Deep copy to prevent mutation issues with server components
}

export async function getTicket(id: string): Promise<Ticket | undefined> {
  return JSON.parse(JSON.stringify(findTicketById(id)));
}

export async function createTicketAction(formData: FormData) {
  // Assuming MOCK_USER is the authenticated user for now
  const solicitanteEmail = MOCK_USER.email;
  const solicitanteName = MOCK_USER.name;

  if (!solicitanteEmail || !solicitanteName) {
    return { success: false, error: 'User not authenticated' };
  }

  const parsed = TicketSchema.safeParse({
    problemDescription: formData.get('problemDescription'),
    priority: formData.get('priority'),
    type: formData.get('type'),
    responsavelEmail: formData.get('responsavelEmail') || null,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const newTicket: Ticket = {
    id: generateTicketId(),
    ...data,
    solicitanteEmail,
    solicitanteName,
    responsavelEmail: data.responsavelEmail || null, // Ensure null if empty string
    status: 'Open', // Default status for new tickets
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  addTicketToStore(newTicket);
  // TODO: Implement Discord notification here
  // e.g., sendDiscordNotification(newTicket);

  revalidatePath('/dashboard');
  return { success: true, ticket: newTicket };
}

export async function updateTicketAction(id: string, formData: FormData) {
  const existingTicket = findTicketById(id);
  if (!existingTicket) {
    return { success: false, error: 'Ticket not found' };
  }

  const parsed = TicketSchema.extend({
     status: z.enum(ticketStatuses), // Status is editable for updates
  }).safeParse({
    problemDescription: formData.get('problemDescription'),
    priority: formData.get('priority'),
    type: formData.get('type'),
    responsavelEmail: formData.get('responsavelEmail') || null,
    status: formData.get('status'),
    resolutionDetails: formData.get('resolutionDetails') || undefined,
  });
  
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }
  
  const data = parsed.data;

  const updatedTicketData: Partial<Ticket> = {
    ...data,
    responsavelEmail: data.responsavelEmail || null,
    updatedAt: new Date().toISOString(),
  };

  // Filter out undefined optional fields
  if (data.resolutionDetails === undefined) delete updatedTicketData.resolutionDetails;


  const success = updateTicketInStore({ ...existingTicket, ...updatedTicketData });

  if (success) {
    revalidatePath('/dashboard');
    revalidatePath(`/tickets/${id}`); // If a detail page exists
    return { success: true, ticket: { ...existingTicket, ...updatedTicketData } };
  }
  
  return { success: false, error: 'Failed to update ticket' };
}


export async function getPermittedAssignees(): Promise<Assignee[]> {
  // In a real app, this might come from a user directory or database
  return PERMITTED_ASSIGNEES;
}

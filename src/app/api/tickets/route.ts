
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Priority, TicketStatus, TicketType, Environment, Origin } from '@/types';
import { priorities, ticketStatuses, ticketTypes, environments, origins } from '@/types';
import { MOCK_CUSTOM_USER_SESSION_DATA } from '@/lib/constants'; // For solicitanteName

const TicketSchema = z.object({
  problemDescription: z.string().min(10, 'A descrição do problema deve ter pelo menos 10 caracteres.'),
  priority: z.enum(priorities as [string, ...string[]]),
  type: z.enum(ticketTypes as [string, ...string[]]),
  responsavelEmail: z.string().email({ message: "E-mail inválido." }).nullable().or(z.literal('')),
  // status is handled by default on creation
  evidencias: z.string().min(1, 'O campo Evidências é obrigatório.'),
  anexos: z.string().optional(),
  ambiente: z.enum(environments as [string, ...string[]]),
  origem: z.enum(origins as [string, ...string[]]),
});

export async function GET(request: NextRequest) {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return NextResponse.json({ message: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticatedUserEmail = request.headers.get('X-Authenticated-User-Email');
    if (!authenticatedUserEmail) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    // In a real app, you'd fetch the user's name from your user database/service
    // For this mock, we'll use a constant name if the email matches the mock user.
    const solicitanteName = authenticatedUserEmail === MOCK_CUSTOM_USER_SESSION_DATA.email 
                            ? MOCK_CUSTOM_USER_SESSION_DATA.name 
                            : "Usuário";


    const body = await request.json();
    const parsed = TicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;
    
    const newTicket = await prisma.ticket.create({
      data: {
        ...data,
        priority: data.priority as Priority,
        type: data.type as TicketType,
        ambiente: data.ambiente as Environment,
        origem: data.origem as Origin,
        solicitanteEmail: authenticatedUserEmail,
        solicitanteName: solicitanteName, // You might want to get this from a User table based on email
        responsavelEmail: data.responsavelEmail === '' ? null : data.responsavelEmail,
        status: 'Para fazer' as TicketStatus, // Default status
        // anexo and resolutionDetails are optional and already in data
      },
    });

    // TODO: Implement Discord notification here
    // e.g., sendDiscordNotification(newTicket);

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Failed to create ticket:', error);
    return NextResponse.json({ message: 'Failed to create ticket' }, { status: 500 });
  }
}

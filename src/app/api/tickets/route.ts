
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
    console.error('Failed to fetch tickets:', error); // Server-side log
    
    let responseMessage = 'An unexpected error occurred while fetching tickets.';
    let errorDetails: any = null;

    if (error instanceof Error) {
      responseMessage = `Failed to fetch tickets: ${error.name}`;
      if (process.env.NODE_ENV !== 'production') {
        responseMessage = `Failed to fetch tickets: ${error.message}`;
        errorDetails = { name: error.name, message: error.message, stack: error.stack };
      }
    }
    
    const clientMessage = (process.env.NODE_ENV === 'production') 
                          ? 'Failed to fetch tickets. Please check server logs for details.' 
                          : responseMessage;

    return NextResponse.json({ message: clientMessage, ...(errorDetails && {details: errorDetails}) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticatedUserEmail = request.headers.get('X-Authenticated-User-Email');
    if (!authenticatedUserEmail) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
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
        solicitanteName: solicitanteName,
        responsavelEmail: data.responsavelEmail === '' ? null : data.responsavelEmail,
        status: 'Para fazer' as TicketStatus,
      },
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Failed to create ticket:', error); // Server-side log
    
    let responseMessage = 'An unexpected error occurred while creating the ticket.';
    let errorDetails: any = null;

    if (error instanceof Error) {
      responseMessage = `Failed to create ticket: ${error.name}`;
      if (process.env.NODE_ENV !== 'production') {
        responseMessage = `Failed to create ticket: ${error.message}`;
        errorDetails = { name: error.name, message: error.message, stack: error.stack };
      }
    }
    
    const clientMessage = (process.env.NODE_ENV === 'production') 
                          ? 'Failed to create ticket. Please check server logs for details.' 
                          : responseMessage;
                          
    return NextResponse.json({ message: clientMessage, ...(errorDetails && {details: errorDetails}) }, { status: 500 });
  }
}

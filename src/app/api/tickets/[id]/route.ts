
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Priority, TicketStatus, TicketType, Environment, Origin } from '@/types';
import { priorities, ticketStatuses, ticketTypes, environments, origins } from '@/types';

const UpdateTicketSchema = z.object({
  problemDescription: z.string().min(10, 'A descrição do problema deve ter pelo menos 10 caracteres.'),
  priority: z.enum(priorities as [string, ...string[]]),
  type: z.enum(ticketTypes as [string, ...string[]]),
  responsavelEmail: z.string().email({ message: "E-mail inválido." }).nullable().or(z.literal('')),
  status: z.enum(ticketStatuses as [string, ...string[]]), // Status is required for update
  resolutionDetails: z.string().optional(),
  evidencias: z.string().min(1, 'O campo Evidências é obrigatório.'),
  anexos: z.string().optional(),
  ambiente: z.enum(environments as [string, ...string[]]),
  origem: z.enum(origins as [string, ...string[]]),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (error) {
    console.error(`Failed to fetch ticket ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: params.id },
    });

    if (!existingTicket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = UpdateTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;
    const now = new Date();

    let inicioAtendimento = existingTicket.inicioAtendimento;
    if (existingTicket.status === 'Para fazer' && data.status === 'Em Andamento' && !existingTicket.inicioAtendimento) {
      inicioAtendimento = now;
    }

    let terminoAtendimento = existingTicket.terminoAtendimento;
    if (data.status === 'Finalizado' && existingTicket.status !== 'Finalizado') {
      terminoAtendimento = now;
    } else if (existingTicket.status === 'Finalizado' && data.status !== 'Finalizado') {
      terminoAtendimento = null; 
    }
    
    const updatedTicketData = {
      ...data,
      priority: data.priority as Priority,
      type: data.type as TicketType,
      status: data.status as TicketStatus,
      ambiente: data.ambiente as Environment,
      origem: data.origem as Origin,
      responsavelEmail: data.responsavelEmail === '' ? null : data.responsavelEmail,
      updatedAt: now,
      inicioAtendimento,
      terminoAtendimento,
      // anexos and resolutionDetails are already in data or will be undefined if not provided
    };

    // Prisma handles undefined optional fields correctly (doesn't update them)
    // So no need to delete them from updatedTicketData

    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: updatedTicketData,
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error(`Failed to update ticket ${params.id}:`, error);
    // Check for specific Prisma errors if needed, e.g., P2025 for record not found during update
    return NextResponse.json({ message: 'Failed to update ticket' }, { status: 500 });
  }
}

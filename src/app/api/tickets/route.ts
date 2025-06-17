
'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { PERMITTED_ASSIGNEES } from '@/lib/constants';

const TicketApiSchema = z.object({
  problemDescription: z.string().min(10, 'A descrição do problema deve ter pelo menos 10 caracteres.'),
  priority: z.string().min(1, "Prioridade é obrigatória."),
  type: z.string().min(1, "Tipo é obrigatório."),
  responsavelEmail: z.string().email({ message: "E-mail inválido para responsável." }).nullable().or(z.literal('')),
  evidencias: z.string().min(1, 'O campo Evidências é obrigatório.'),
  anexos: z.string().optional().nullable(),
  ambiente: z.string().min(1, "Ambiente é obrigatória."),
  origem: z.string().min(1, "Origem é obrigatória."),
});

async function getNextTicketNumber(): Promise<string> {
  const allTickets = await prisma.ticket.findMany({
    select: { numeroTicket: true },
    orderBy: { createdAt: 'asc' } 
  });

  let maxNumericPart = 0;
  allTickets.forEach(ticket => {
    if (ticket.numeroTicket && ticket.numeroTicket.startsWith('TCK-')) {
      const numericStr = ticket.numeroTicket.substring(4);
      const numericVal = parseInt(numericStr, 10);
      if (!isNaN(numericVal) && numericVal > maxNumericPart) {
        maxNumericPart = numericVal;
      }
    }
  });
  const nextNumericValue = maxNumericPart + 1;
  return `TCK-${String(nextNumericValue).padStart(3, '0')}`;
}


export async function GET(request: NextRequest) {
  try {
    // User info is now in headers from middleware
    // const userId = request.headers.get('X-User-Id');
    // if (!userId) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    
    const tickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        prioridade: true,
        tipo: true,
        ambiente: true,
        origem: true,
        solicitante: true,
        responsavel: true,
        situacao: true,
      }
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
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
    const solicitanteIdFromToken = request.headers.get('X-User-Id');
    const solicitanteEmailFromToken = request.headers.get('X-User-Email');
    const solicitanteNameFromToken = request.headers.get('X-User-Name');

    if (!solicitanteIdFromToken || !solicitanteEmailFromToken) {
        return NextResponse.json({ message: 'Authentication required: User details not found in token.' }, { status: 401 });
    }

    const body = await request.json(); 
    const parsed = TicketApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data = parsed.data;
    
    // Solicitante is now directly from token, ensure the user exists or handle as needed.
    // For simplicity, we assume middleware validated the user, so we connect by ID.
    // If the user might not exist in DB (e.g. token from external system), upsert logic might be needed.
    // Here, we directly use the ID from the token.
    const solicitanteConnect = { connect: { id: solicitanteIdFromToken } };


    let responsavelConnect = undefined;
    if (data.responsavelEmail && data.responsavelEmail !== '') {
      const responsavelDetails = PERMITTED_ASSIGNEES.find(u => u.email === data.responsavelEmail) ||
                                 { email: data.responsavelEmail, name: data.responsavelEmail.split('@')[0] };
      const responsavel = await prisma.usuario.upsert({
        where: { email: data.responsavelEmail },
        update: { nome: responsavelDetails.email },
        create: {
          email: data.responsavelEmail,
          nome: responsavelDetails.email,
        },
      });
      responsavelConnect = { connect: { id: responsavel.id } };
    }

    const prioridadeRecord = await prisma.prioridade.findUnique({ where: { descricao: data.priority } });
    const tipoRecord = await prisma.tipo.findUnique({ where: { descricao: data.type } });
    const ambienteRecord = await prisma.ambiente.findUnique({ where: { descricao: data.ambiente } });
    const origemRecord = await prisma.origem.findUnique({ where: { descricao: data.origem } });
    const situacaoRecord = await prisma.situacao.findUnique({ where: { descricao: "Para Fazer" } }); 

    const missingLookups = [
        !prioridadeRecord ? `Prioridade '${data.priority}'` : null,
        !tipoRecord ? `Tipo '${data.type}'` : null,
        !ambienteRecord ? `Ambiente '${data.ambiente}'` : null,
        !origemRecord ? `Origem '${data.origem}'` : null,
        !situacaoRecord ? `Situação 'Para Fazer'` : null,
      ].filter(Boolean);

    if (missingLookups.length > 0) {
      return NextResponse.json({ message: `Could not find required lookup values: ${missingLookups.join(', ')}. Please ensure these exist in the database.` }, { status: 400 });
    }

    const numeroTicket = await getNextTicketNumber();

    const newTicket = await prisma.ticket.create({
      data: {
        numeroTicket, 
        problemDescription: data.problemDescription,
        prioridade: { connect: { id: prioridadeRecord!.id } },
        tipo: { connect: { id: tipoRecord!.id } },
        ambiente: { connect: { id: ambienteRecord!.id } },
        origem: { connect: { id: origemRecord!.id } },
        solicitante: solicitanteConnect,
        responsavel: responsavelConnect,
        situacao: { connect: { id: situacaoRecord!.id } }, 
        evidencias: data.evidencias,
        anexos: data.anexos,
      },
       include: {
        prioridade: true, tipo: true, ambiente: true, origem: true,
        solicitante: true, responsavel: true, situacao: true
      }
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Failed to create ticket:', error);
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

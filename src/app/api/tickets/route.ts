
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { MOCK_CUSTOM_USER_SESSION_DATA, PERMITTED_ASSIGNEES } from '@/lib/constants';
import { prioridadeValues, tipoValues, ambienteValues, origemValues, situacaoValues } from '@/types';

// Zod schema for incoming ticket data (uses string descriptions)
const TicketSchema = z.object({
  problemDescription: z.string().min(10, 'A descrição do problema deve ter pelo menos 10 caracteres.'),
  priority: z.string().refine(val => prioridadeValues.includes(val), { message: "Prioridade inválida."}),
  type: z.string().refine(val => tipoValues.includes(val), { message: "Tipo inválido."}),
  responsavelEmail: z.string().email({ message: "E-mail inválido para responsável." }).nullable().or(z.literal('')),
  evidencias: z.string().min(1, 'O campo Evidências é obrigatório.'),
  anexos: z.string().optional(),
  ambiente: z.string().refine(val => ambienteValues.includes(val), { message: "Ambiente inválido."}),
  origem: z.string().refine(val => origemValues.includes(val), { message: "Origem inválida."}),
  // status is handled by default on creation, so not in this schema for POST
});


export async function GET(request: NextRequest) {
  try {
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
    const authenticatedUserEmail = request.headers.get('X-Authenticated-User-Email');
    if (!authenticatedUserEmail) {
        return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    // Determine solicitanteName based on authenticated user or fallback
    // For mock, we use MOCK_CUSTOM_USER_SESSION_DATA, in real app, this would come from token/session
    const solicitanteDetails = PERMITTED_ASSIGNEES.find(u => u.email === authenticatedUserEmail) || 
                               MOCK_CUSTOM_USER_SESSION_DATA;


    const body = await request.json();
    const parsed = TicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data = parsed.data;

    // Find or create Solicitante
    const solicitante = await prisma.usuario.upsert({
      where: { email: authenticatedUserEmail },
      update: { nome: solicitanteDetails.name || authenticatedUserEmail.split('@')[0] },
      create: { email: authenticatedUserEmail, nome: solicitanteDetails.name || authenticatedUserEmail.split('@')[0] },
    });

    // Find or create Responsavel if email is provided
    let responsavelConnect = undefined;
    if (data.responsavelEmail && data.responsavelEmail !== '') {
      const responsavelDetails = PERMITTED_ASSIGNEES.find(u => u.email === data.responsavelEmail) || 
                                 { email: data.responsavelEmail, name: data.responsavelEmail.split('@')[0] };
      const responsavel = await prisma.usuario.upsert({
        where: { email: data.responsavelEmail },
        update: { nome: responsavelDetails.name },
        create: { email: data.responsavelEmail, nome: responsavelDetails.name },
      });
      responsavelConnect = { connect: { id: responsavel.id } };
    }
    
    // Look up related entities by their descriptions
    const prioridadeRecord = await prisma.prioridade.findUnique({ where: { descricao: data.priority } });
    const tipoRecord = await prisma.tipo.findUnique({ where: { descricao: data.type } });
    const ambienteRecord = await prisma.ambiente.findUnique({ where: { descricao: data.ambiente } });
    const origemRecord = await prisma.origem.findUnique({ where: { descricao: data.origem } });
    const situacaoRecord = await prisma.situacao.findUnique({ where: { descricao: "Para fazer" } }); // Default status

    if (!prioridadeRecord || !tipoRecord || !ambienteRecord || !origemRecord || !situacaoRecord) {
      const missing = [
        !prioridadeRecord ? `Prioridade '${data.priority}'` : null,
        !tipoRecord ? `Tipo '${data.type}'` : null,
        !ambienteRecord ? `Ambiente '${data.ambiente}'` : null,
        !origemRecord ? `Origem '${data.origem}'` : null,
        !situacaoRecord ? `Situação 'Para fazer'` : null,
      ].filter(Boolean).join(', ');
      return NextResponse.json({ message: `Could not find required lookup values: ${missing}. Please ensure these exist in the database.` }, { status: 400 });
    }

    const newTicket = await prisma.ticket.create({
      data: {
        problemDescription: data.problemDescription,
        prioridade: { connect: { id: prioridadeRecord.id } },
        tipo: { connect: { id: tipoRecord.id } },
        ambiente: { connect: { id: ambienteRecord.id } },
        origem: { connect: { id: origemRecord.id } },
        solicitante: { connect: { id: solicitante.id } },
        responsavel: responsavelConnect,
        situacao: { connect: { id: situacaoRecord.id } },
        evidencias: data.evidencias,
        anexos: data.anexos,
      },
       include: { // Include related data in the response
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

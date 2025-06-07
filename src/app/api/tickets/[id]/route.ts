
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { PERMITTED_ASSIGNEES } from '@/lib/constants';
import { prioridadeValues, tipoValues, ambienteValues, origemValues, situacaoValues, type TicketFormData } from '@/types';


// Zod schema for incoming ticket data (uses string descriptions from TicketFormData)
const UpdateTicketApiSchema = z.object({
  problemDescription: z.string().min(10, 'A descrição do problema deve ter pelo menos 10 caracteres.'),
  priority: z.string().refine(val => prioridadeValues.includes(val), { message: "Prioridade inválida."}),
  type: z.string().refine(val => tipoValues.includes(val), { message: "Tipo inválido."}),
  responsavelEmail: z.string().email({ message: "E-mail inválido para responsável." }).nullable().or(z.literal('')),
  status: z.string().refine(val => situacaoValues.includes(val), { message: "Situação inválida."}),
  resolutionDetails: z.string().optional().nullable(),
  evidencias: z.string().min(1, 'O campo Evidências é obrigatório.'),
  anexos: z.string().optional().nullable(),
  ambiente: z.string().refine(val => ambienteValues.includes(val), { message: "Ambiente inválido."}),
  origem: z.string().refine(val => origemValues.includes(val), { message: "Origem inválida."}),
});


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
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

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (error) {
    console.error(`Failed to fetch ticket ${params.id}:`, error);
    let responseMessage = `An unexpected error occurred while fetching ticket ${params.id}.`;
    let errorDetails: any = null;
    if (error instanceof Error) {
      responseMessage = `Failed to fetch ticket ${params.id}: ${error.name}`;
      if (process.env.NODE_ENV !== 'production') {
        responseMessage = `Failed to fetch ticket ${params.id}: ${error.message}`;
        errorDetails = { name: error.name, message: error.message, stack: error.stack };
      }
    }
    const clientMessage = (process.env.NODE_ENV === 'production') 
                          ? `Failed to fetch ticket ${params.id}. Please check server logs for details.` 
                          : responseMessage;
    return NextResponse.json({ message: clientMessage, ...(errorDetails && {details: errorDetails}) }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { situacao: true } 
    });

    if (!existingTicket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    const body: TicketFormData = await request.json();
    const parsed = UpdateTicketApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data = parsed.data;
    const now = new Date();

    // Handle responsavel connection
    let responsavelConnectDisconnect = {};
    if (data.responsavelEmail && data.responsavelEmail !== '') {
      const responsavelDetails = PERMITTED_ASSIGNEES.find(u => u.email === data.responsavelEmail) || 
                                 { email: data.responsavelEmail, name: data.responsavelEmail.split('@')[0] };
      const responsavel = await prisma.usuario.upsert({
        where: { email: data.responsavelEmail },
        update: { nome: responsavelDetails.name },
        create: { 
          email: data.responsavelEmail, 
          nome: responsavelDetails.name,
          // hashedPassword and fotoUrl are not set here
        },
      });
      responsavelConnectDisconnect = { responsavel: { connect: { id: responsavel.id } } };
    } else {
      responsavelConnectDisconnect = { responsavel: { disconnect: true } };
    }

    // Look up related entities
    const prioridadeRecord = await prisma.prioridade.findUnique({ where: { descricao: data.priority } });
    const tipoRecord = await prisma.tipo.findUnique({ where: { descricao: data.type } });
    const ambienteRecord = await prisma.ambiente.findUnique({ where: { descricao: data.ambiente } });
    const origemRecord = await prisma.origem.findUnique({ where: { descricao: data.origem } });
    const situacaoRecord = await prisma.situacao.findUnique({ where: { descricao: data.status as string } }); // data.status is guaranteed by Zod

    if (!prioridadeRecord || !tipoRecord || !ambienteRecord || !origemRecord || !situacaoRecord) {
       const missing = [
        !prioridadeRecord ? `Prioridade '${data.priority}'` : null,
        !tipoRecord ? `Tipo '${data.type}'` : null,
        !ambienteRecord ? `Ambiente '${data.ambiente}'` : null,
        !origemRecord ? `Origem '${data.origem}'` : null,
        !situacaoRecord ? `Situação '${data.status}'` : null,
      ].filter(Boolean).join(', ');
      return NextResponse.json({ message: `Could not find required lookup values: ${missing}.` }, { status: 400 });
    }

    // Handle inicioAtendimento and terminoAtendimento logic
    let inicioAtendimento = existingTicket.inicioAtendimento;
    if (existingTicket.situacao.descricao === 'Para fazer' && situacaoRecord.descricao === 'Em Andamento' && !existingTicket.inicioAtendimento) {
      inicioAtendimento = now;
    }

    let terminoAtendimento = existingTicket.terminoAtendimento;
    if (situacaoRecord.descricao === 'Finalizado' && existingTicket.situacao.descricao !== 'Finalizado') {
      terminoAtendimento = now;
    } else if (existingTicket.situacao.descricao === 'Finalizado' && situacaoRecord.descricao !== 'Finalizado') {
      terminoAtendimento = null; 
    }
    
    const updatedTicketData = {
      problemDescription: data.problemDescription,
      prioridade: { connect: { id: prioridadeRecord.id } },
      tipo: { connect: { id: tipoRecord.id } },
      ambiente: { connect: { id: ambienteRecord.id } },
      origem: { connect: { id: origemRecord.id } },
      situacao: { connect: { id: situacaoRecord.id } },
      ...responsavelConnectDisconnect,
      evidencias: data.evidencias,
      anexos: data.anexos,
      resolutionDetails: data.resolutionDetails,
      updatedAt: now,
      inicioAtendimento,
      terminoAtendimento,
    };

    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: updatedTicketData,
      include: { 
        prioridade: true, tipo: true, ambiente: true, origem: true, 
        solicitante: true, responsavel: true, situacao: true
      }
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error(`Failed to update ticket ${params.id}:`, error);
    let responseMessage = `An unexpected error occurred while updating ticket ${params.id}.`;
    let errorDetails: any = null;
    if (error instanceof Error) {
      responseMessage = `Failed to update ticket ${params.id}: ${error.name}`;
      if (process.env.NODE_ENV !== 'production') {
        responseMessage = `Failed to update ticket ${params.id}: ${error.message}`;
        errorDetails = { name: error.name, message: error.message, stack: error.stack };
      }
    }
    const clientMessage = (process.env.NODE_ENV === 'production') 
                          ? `Failed to update ticket ${params.id}. Please check server logs for details.` 
                          : responseMessage;
    return NextResponse.json({ message: clientMessage, ...(errorDetails && {details: errorDetails}) }, { status: 500 });
  }
}

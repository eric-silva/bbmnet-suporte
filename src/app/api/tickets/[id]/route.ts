
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { PERMITTED_ASSIGNEES } from '@/lib/constants';
// TicketFormData is now more aligned with what the form prepares (arrays of filenames)
import type { TicketFormData as ApiTicketUpdatePayload } from '@/types';


// Zod schema for incoming ticket data for updates
const UpdateTicketApiSchema = z.object({
  problemDescription: z.string().min(10, 'A descrição do problema deve ter pelo menos 10 caracteres.'),
  priority: z.string().min(1, "Prioridade é obrigatória."),
  type: z.string().min(1, "Tipo é obrigatório."),
  responsavelEmail: z.string().email({ message: "E-mail inválido para responsável." }).nullable().or(z.literal('')),
  status: z.string().min(1, "Situação é obrigatória."),
  resolutionDetails: z.string().optional().nullable(),
  evidencias: z.array(z.string()).min(1, 'Pelo menos uma evidência é obrigatória.'), // Expect array of filenames
  anexos: z.array(z.string()).optional().nullable(), // Expect array of filenames or null
  ambiente: z.string().min(1, "Ambiente é obrigatório."),
  origem: z.string().min(1, "Origem é obrigatória."),
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

    const body: ApiTicketUpdatePayload = await request.json(); // Expects arrays of filenames
    const parsed = UpdateTicketApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data = parsed.data;
    const now = new Date();

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
        },
      });
      responsavelConnectDisconnect = { responsavel: { connect: { id: responsavel.id } } };
    } else {
      responsavelConnectDisconnect = { responsavel: { disconnect: true } };
    }

    const prioridadeRecord = await prisma.prioridade.findUnique({ where: { descricao: data.priority } });
    const tipoRecord = await prisma.tipo.findUnique({ where: { descricao: data.type } });
    const ambienteRecord = await prisma.ambiente.findUnique({ where: { descricao: data.ambiente } });
    const origemRecord = await prisma.origem.findUnique({ where: { descricao: data.origem } });
    const situacaoRecord = await prisma.situacao.findUnique({ where: { descricao: data.status as string } });

    const missingLookups = [
        !prioridadeRecord ? `Prioridade '${data.priority}'` : null,
        !tipoRecord ? `Tipo '${data.type}'` : null,
        !ambienteRecord ? `Ambiente '${data.ambiente}'` : null,
        !origemRecord ? `Origem '${data.origem}'` : null,
        !situacaoRecord ? `Situação '${data.status}'` : null,
      ].filter(Boolean);

    if (missingLookups.length > 0) {
      return NextResponse.json({ message: `Could not find required lookup values: ${missingLookups.join(', ')}. Please ensure these exist in the database.` }, { status: 400 });
    }

    let inicioAtendimento = existingTicket.inicioAtendimento;
    if (existingTicket.situacao.descricao === 'Para fazer' && situacaoRecord!.descricao === 'Em Andamento' && !existingTicket.inicioAtendimento) {
      inicioAtendimento = now;
    }

    let terminoAtendimento = existingTicket.terminoAtendimento;
    if (situacaoRecord!.descricao === 'Finalizado' && existingTicket.situacao.descricao !== 'Finalizado') {
      terminoAtendimento = now;
    } else if (existingTicket.situacao.descricao === 'Finalizado' && situacaoRecord!.descricao !== 'Finalizado') {
      terminoAtendimento = null;
    }

    const evidenciasJsonString = JSON.stringify(data.evidencias);
    const anexosJsonString = data.anexos ? JSON.stringify(data.anexos) : null;

    const updatedTicketData = {
      problemDescription: data.problemDescription,
      prioridade: { connect: { id: prioridadeRecord!.id } },
      tipo: { connect: { id: tipoRecord!.id } },
      ambiente: { connect: { id: ambienteRecord!.id } },
      origem: { connect: { id: origemRecord!.id } },
      situacao: { connect: { id: situacaoRecord!.id } },
      ...responsavelConnectDisconnect,
      evidencias: evidenciasJsonString,
      anexos: anexosJsonString,
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

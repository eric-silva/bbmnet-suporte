
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { UsuarioFormData } from '@/types';

const UpdateUsuarioApiSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.').optional(),
  email: z.string().email('Por favor, insira um e-mail válido.').optional(),
  fotoUrl: z.string().url('URL da foto inválida.').optional().nullable(),
  isAtivo: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id },
    });

    if (!usuario) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }
    return NextResponse.json(usuario);
  } catch (error) {
    console.error(`Falha ao buscar usuário ${params.id}:`, error);
    let errorMessage = `Ocorreu um erro inesperado ao buscar o usuário ${params.id}.`;
     if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = UpdateUsuarioApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Entrada inválida', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data: Partial<UsuarioFormData> = parsed.data;

    if (data.email) {
      const existingUser = await prisma.usuario.findFirst({
        where: { 
          email: data.email,
          NOT: { id: params.id } // Exclude current user from check
        },
      });
      if (existingUser) {
        return NextResponse.json({ message: 'Este e-mail já está em uso por outro usuário.' }, { status: 409 });
      }
    }
    
    const updatedUsuario = await prisma.usuario.update({
      where: { id: params.id },
      data: {
        ...(data.nome && { nome: data.nome }),
        ...(data.email && { email: data.email }),
        ...(data.hasOwnProperty('fotoUrl') && { fotoUrl: data.fotoUrl }), // Check hasOwnProperty to allow setting null
        ...(typeof data.isAtivo === 'boolean' && { isAtivo: data.isAtivo }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedUsuario);
  } catch (error) {
    console.error(`Falha ao atualizar usuário ${params.id}:`, error);
    let errorMessage = `Ocorreu um erro inesperado ao atualizar o usuário ${params.id}.`;
    if (error instanceof Error) {
        if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
            errorMessage = 'Este e-mail já está cadastrado por outro usuário.';
            return NextResponse.json({ message: errorMessage }, { status: 409 });
        }
         if ((error as any).code === 'P2025') { // Record to update not found
            errorMessage = 'Usuário não encontrado para atualização.';
            return NextResponse.json({ message: errorMessage }, { status: 404 });
        }
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Optional: Check for related tickets before deleting
    const ticketsCriados = await prisma.ticket.count({ where: { solicitanteId: params.id } });
    const ticketsAtribuidos = await prisma.ticket.count({ where: { responsavelId: params.id } });

    if (ticketsCriados > 0 || ticketsAtribuidos > 0) {
      return NextResponse.json({ 
        message: 'Este usuário não pode ser excluído pois está associado a tickets. Considere inativar o usuário em vez disso.' 
      }, { status: 409 }); // 409 Conflict
    }

    await prisma.usuario.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Usuário excluído com sucesso' }, { status: 200 });
  } catch (error) {
    console.error(`Falha ao excluir usuário ${params.id}:`, error);
    let errorMessage = `Ocorreu um erro inesperado ao excluir o usuário ${params.id}.`;
    if (error instanceof Error) {
        if ((error as any).code === 'P2025') { // Record to delete not found
             errorMessage = 'Usuário não encontrado para exclusão.';
            return NextResponse.json({ message: errorMessage }, { status: 404 });
        }
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

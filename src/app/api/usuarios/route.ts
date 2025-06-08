
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { UsuarioFormData } from '@/types';

const CreateUsuarioApiSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.'),
  fotoUrl: z.string().url('URL da foto inválida.').optional().nullable(),
  // isAtivo will default to true via Prisma schema, not explicitly set on creation via API
});

export async function GET(request: NextRequest) {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: {
        nome: 'asc',
      },
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Falha ao buscar usuários:', error);
    let errorMessage = 'Ocorreu um erro inesperado ao buscar usuários.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateUsuarioApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Entrada inválida', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const data: UsuarioFormData = parsed.data;

    // Check for email uniqueness
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'Este e-mail já está em uso.' }, { status: 409 }); // 409 Conflict
    }

    const newUsuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        fotoUrl: data.fotoUrl,
        // isAtivo defaults to true in Prisma schema
        // hashedPassword would be set here in a full auth system
      },
    });

    return NextResponse.json(newUsuario, { status: 201 });
  } catch (error) {
    console.error('Falha ao criar usuário:', error);
    let errorMessage = 'Ocorreu um erro inesperado ao criar o usuário.';
    if (error instanceof Error) {
        if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('email')) {
            errorMessage = 'Este e-mail já está cadastrado.';
            return NextResponse.json({ message: errorMessage }, { status: 409 });
        }
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}


'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { UsuarioFormData } from '@/types';
import { ALLOWED_DOMAINS } from '@/lib/constants';
import crypto from 'crypto';

function sha1(data: string): string {
  return crypto.createHash('sha1').update(data).digest('hex');
}

const CreateUsuarioApiSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Por favor, insira um e-mail válido.')
    .refine(email => {
      const domain = email.substring(email.lastIndexOf('@') + 1);
      return ALLOWED_DOMAINS.includes(domain);
    }, { message: `O domínio do e-mail não é permitido. Domínios aceitos: ${ALLOWED_DOMAINS.join(', ')}` }),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  fotoUrl: z.string().optional().nullable().or(z.literal('')), // Allow Data URI or empty/null
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
    const data = parsed.data;

    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'Este e-mail já está em uso.' }, { status: 409 });
    }

    const hashedPassword = sha1(data.password);

    const newUsuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        hashedPassword: hashedPassword,
        fotoUrl: data.fotoUrl || null, // Save Base64 or null
        isAtivo: true,
      },
    });

    const { hashedPassword: _, ...userWithoutPassword } = newUsuario;
    return NextResponse.json(userWithoutPassword, { status: 201 });

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

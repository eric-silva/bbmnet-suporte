
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const LoginRequestSchema = z.object({
  email: z.string().email({ message: "E-mail inválido." }),
  password: z.string().min(1, { message: "Senha é obrigatória." }), // Password received but not used for validation in this mock
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Entrada inválida', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await prisma.usuario.findUnique({
      where: { email: email },
      select: {
        id: true,
        nome: true,
        email: true,
        isAtivo: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado ou credenciais inválidas.' }, { status: 401 });
    }

    if (!user.isAtivo) {
        return NextResponse.json({ message: 'Este usuário está inativo. Entre em contato com o administrador.' }, { status: 403 });
    }

    // In a real authentication system, you would verify the password here.
    // For this mock, we assume if the user email exists and is active, login is successful.
    // The password from the request is ignored for validation.

    // Return minimal user data for the session
    return NextResponse.json({
      id: user.id,
      name: user.nome,
      email: user.email,
    });

  } catch (error) {
    console.error('Error in mock login API:', error);
    let errorMessage = 'Falha ao tentar fazer login.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

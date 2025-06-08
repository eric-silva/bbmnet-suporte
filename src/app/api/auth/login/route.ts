
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
// In a real app, you'd use a library like jsonwebtoken
// For this example, we'll create a very simple placeholder token

const LoginRequestSchema = z.object({
  email: z.string().email({ message: "E-mail inválido." }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres." }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Entrada inválida', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await prisma.usuario.findUnique({
      where: { email: email },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado ou credenciais inválidas.' }, { status: 401 });
    }

    if (!user.isAtivo) {
        return NextResponse.json({ message: 'Este usuário está inativo. Entre em contato com o administrador.' }, { status: 403 });
    }

    // SIMULATED PASSWORD VERIFICATION - NOT FOR PRODUCTION
    const expectedHashedPassword = `mock_hashed_${password}`;
    if (user.hashedPassword !== expectedHashedPassword) {
      return NextResponse.json({ message: 'Senha inválida.' }, { status: 401 });
    }

    // SIMULATED TOKEN GENERATION - NOT FOR PRODUCTION
    // In a real app, use JWTs signed with a secret key.
    const token = `simulated-token-${user.id}-${Date.now()}`;

    const { hashedPassword, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token: token,
    });

  } catch (error) {
    console.error('Error in login API:', error);
    let errorMessage = 'Falha ao tentar fazer login.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}


'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { SignJWT } from 'jose';
import { sha1Convert } from '@/lib/utils';

// function sha1(data: string): string {
//   return crypto.createHash('sha1').update(data).digest('hex');
// }

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
      where: { email: email},
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado ou credenciais inválidas.' }, { status: 401 });
    }

    if (!user.isAtivo) {
      return NextResponse.json({ message: 'Este usuário está inativo. Entre em contato com o administrador.' }, { status: 403 });
    }
    const hashedPassword = sha1Convert(password);
    if (user.hashedPassword !== hashedPassword) {
      return NextResponse.json({ message: 'Usuário não encontrado ou credenciais inválidas.' }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured in .env file");
      return NextResponse.json({ message: 'Erro de configuração do servidor.' }, { status: 500 });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      name: user.nome,
      fotoUrl: user.fotoUrl,
    };

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);

    const { hashedPassword: _, ...userWithoutPassword } = user;

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
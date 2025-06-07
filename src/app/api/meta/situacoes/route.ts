
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Situacao } from '@/types';

export async function GET() {
  try {
    const situacoes: Situacao[] = await prisma.situacao.findMany({
      orderBy: { descricao: 'asc' } // You might want a custom order logic here
    });
    return NextResponse.json(situacoes);
  } catch (error) {
    console.error('Failed to fetch situacoes:', error);
    return NextResponse.json({ message: 'Failed to fetch situacoes from DB' }, { status: 500 });
  }
}

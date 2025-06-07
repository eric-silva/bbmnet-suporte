
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prioridade } from '@/types';

export async function GET() {
  try {
    const priorities: Prioridade[] = await prisma.prioridade.findMany({
      orderBy: { descricao: 'asc' } // You might want a custom order logic here
    });
    return NextResponse.json(priorities);
  } catch (error) {
    console.error('Failed to fetch priorities:', error);
    return NextResponse.json({ message: 'Failed to fetch priorities from DB' }, { status: 500 });
  }
}

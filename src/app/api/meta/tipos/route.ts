
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Tipo } from '@/types';

export async function GET() {
  try {
    const tipos: Tipo[] = await prisma.tipo.findMany({
      orderBy: { descricao: 'asc' }
    });
    return NextResponse.json(tipos);
  } catch (error) {
    console.error('Failed to fetch tipos:', error);
    return NextResponse.json({ message: 'Failed to fetch tipos from DB' }, { status: 500 });
  }
}

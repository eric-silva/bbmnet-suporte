
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Ambiente } from '@/types';

export async function GET() {
  try {
    const environments: Ambiente[] = await prisma.ambiente.findMany({
      orderBy: { descricao: 'asc' }
    });
    return NextResponse.json(environments);
  } catch (error) {
    console.error('Failed to fetch environments:', error);
    return NextResponse.json({ message: 'Failed to fetch environments from DB' }, { status: 500 });
  }
}

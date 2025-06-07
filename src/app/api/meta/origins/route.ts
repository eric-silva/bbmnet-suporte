
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Origem } from '@/types';

export async function GET() {
  try {
    const origins: Origem[] = await prisma.origem.findMany({
      orderBy: { descricao: 'asc' }
    });
    return NextResponse.json(origins);
  } catch (error) {
    console.error('Failed to fetch origins:', error);
    return NextResponse.json({ message: 'Failed to fetch origins from DB' }, { status: 500 });
  }
}

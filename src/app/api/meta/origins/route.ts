
import { NextResponse } from 'next/server';
import { origins, type Origin } from '@/types';

export async function GET() {
  try {
    const orgs: Origin[] = [...origins];
    return NextResponse.json(orgs);
  } catch (error) {
    console.error('Failed to fetch origins:', error);
    return NextResponse.json({ message: 'Failed to fetch origins' }, { status: 500 });
  }
}

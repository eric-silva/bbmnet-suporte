
import { NextResponse } from 'next/server';
import { environments, type Environment } from '@/types';

export async function GET() {
  try {
    const envs: Environment[] = [...environments];
    return NextResponse.json(envs);
  } catch (error) {
    console.error('Failed to fetch environments:', error);
    return NextResponse.json({ message: 'Failed to fetch environments' }, { status: 500 });
  }
}

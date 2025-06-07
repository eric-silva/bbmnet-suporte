
import { NextResponse } from 'next/server';
import { PERMITTED_ASSIGNEES } from '@/lib/constants';
import type { Assignee } from '@/types';

export async function GET() {
  try {
    // In a real app, this might come from a database or user directory service
    const assignees: Assignee[] = PERMITTED_ASSIGNEES.filter(assignee => 
        assignee.email.endsWith('@pitang.com') || 
        assignee.email.endsWith('@novobbmnet.com.br') || 
        assignee.email.endsWith('@example.com') // example.com for testing
    );
    return NextResponse.json(assignees);
  } catch (error) {
    console.error('Failed to fetch permitted assignees:', error);
    return NextResponse.json({ message: 'Failed to fetch assignees' }, { status: 500 });
  }
}

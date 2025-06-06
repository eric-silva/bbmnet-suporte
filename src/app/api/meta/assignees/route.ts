
import { NextResponse } from 'next/server';
import { PERMITTED_ASSIGNEES } from '@/lib/constants';
import type { Usuario } from '@/types';
// This route can still serve the PERMITTED_ASSIGNEES constant for the dropdown.
// The backend logic for ticket creation/update will handle finding/creating Usuario records.

export async function GET() {
  try {
    const assignees: Usuario[] = PERMITTED_ASSIGNEES.filter(assignee => 
        assignee.email.endsWith('@pitang.com') || 
        assignee.email.endsWith('@novobbmnet.com.br') || 
        assignee.email.endsWith('@email.com') || 
        assignee.email.endsWith('@example.com') // example.com for testing
    );
    return NextResponse.json(assignees);
  } catch (error) {
    console.error('Failed to fetch permitted assignees:', error);
    return NextResponse.json({ message: 'Failed to fetch assignees' }, { status: 500 });
  }
}

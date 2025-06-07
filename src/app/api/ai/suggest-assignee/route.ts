
import { NextResponse, type NextRequest } from 'next/server';
import { suggestAssignee as suggestAssigneeFlow, type SuggestAssigneeInput } from '@/ai/flows/suggest-assignee';
import { z } from 'zod';

const SuggestAssigneeRequestSchema = z.object({
  problemDescription: z.string().min(1, "Problem description cannot be empty."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SuggestAssigneeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const input: SuggestAssigneeInput = {
      problemDescription: parsed.data.problemDescription,
    };
    
    const suggestion = await suggestAssigneeFlow(input);
    return NextResponse.json(suggestion);

  } catch (error) {
    console.error('Error in AI assignee suggestion API:', error);
    let errorMessage = 'Failed to get AI assignee suggestion.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

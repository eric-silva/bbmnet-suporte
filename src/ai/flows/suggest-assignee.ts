'use server';

/**
 * @fileOverview Suggests an appropriate assignee for a support ticket based on the problem description.
 *
 * - suggestAssignee - A function that suggests an assignee for a ticket.
 * - SuggestAssigneeInput - The input type for the suggestAssignee function.
 * - SuggestAssigneeOutput - The return type for the suggestAssignee function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAssigneeInputSchema = z.object({
  problemDescription: z
    .string()
    .describe('The description of the problem for which an assignee is needed.'),
});
export type SuggestAssigneeInput = z.infer<typeof SuggestAssigneeInputSchema>;

const SuggestAssigneeOutputSchema = z.object({
  assigneeEmail: z
    .string()
    .email()
    .describe('The email address of the suggested assignee.'),
  reason: z
    .string()
    .describe(
      'The reasoning behind the assignee suggestion, considering their expertise and workload.'
    ),
});
export type SuggestAssigneeOutput = z.infer<typeof SuggestAssigneeOutputSchema>;

export async function suggestAssignee(input: SuggestAssigneeInput): Promise<SuggestAssigneeOutput> {
  return suggestAssigneeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAssigneePrompt',
  input: {schema: SuggestAssigneeInputSchema},
  output: {schema: SuggestAssigneeOutputSchema},
  prompt: `You are an AI assistant helping to assign support tickets to the most appropriate person.

  Given the following problem description, suggest an assignee (email address) and explain your reasoning. Consider their expertise and current workload.

  Problem Description: {{{problemDescription}}}
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestAssigneeFlow = ai.defineFlow(
  {
    name: 'suggestAssigneeFlow',
    inputSchema: SuggestAssigneeInputSchema,
    outputSchema: SuggestAssigneeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

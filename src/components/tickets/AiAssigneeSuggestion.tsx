'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, UserCheck } from 'lucide-react';
import { suggestAssignee, type SuggestAssigneeInput, type SuggestAssigneeOutput } from '@/ai/flows/suggest-assignee';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AiAssigneeSuggestionProps {
  problemDescription: string;
  currentAssignee?: string | null;
  onSuggestionAccept: (assigneeEmail: string) => void;
  disabled?: boolean;
}

export function AiAssigneeSuggestion({
  problemDescription,
  onSuggestionAccept,
  currentAssignee,
  disabled,
}: AiAssigneeSuggestionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestAssigneeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestAssignee = useCallback(async () => {
    if (!problemDescription.trim() || problemDescription.length < 20) {
      setError('Please provide a more detailed problem description (at least 20 characters).');
      setSuggestion(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const input: SuggestAssigneeInput = { problemDescription };
      const result = await suggestAssignee(input);
      setSuggestion(result);
    } catch (err) {
      console.error('Error suggesting assignee:', err);
      setError('Failed to get AI suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [problemDescription]);

  const handleAcceptSuggestion = () => {
    if (suggestion) {
      onSuggestionAccept(suggestion.assigneeEmail);
      setSuggestion(null); // Clear suggestion after accepting
    }
  };

  return (
    <Card className="mt-4 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-headline">
          <Sparkles className="mr-2 h-5 w-5 text-accent" />
          AI Assignee Suggestion
        </CardTitle>
        <CardDescription>
          Let AI suggest an assignee based on the problem description.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleSuggestAssignee}
          disabled={isLoading || disabled || !problemDescription || problemDescription.length < 20}
          type="button"
          variant="outline"
          className="w-full mb-4"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Suggest Assignee
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestion && (
          <Alert variant="default" className="bg-primary/10 border-primary/30">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="font-headline text-primary">AI Suggestion</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                <strong>Assignee:</strong> {suggestion.assigneeEmail}
              </p>
              <p>
                <strong>Reason:</strong> {suggestion.reason}
              </p>
              {currentAssignee !== suggestion.assigneeEmail && (
                 <Button
                    onClick={handleAcceptSuggestion}
                    size="sm"
                    className="mt-2"
                    type="button"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Accept Suggestion
                  </Button>
              )}
             {currentAssignee === suggestion.assigneeEmail && (
                <p className="text-sm text-green-700 font-medium mt-2">This assignee is already selected.</p>
             )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}


'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
// Textarea no longer needed here directly
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, UserCheck } from 'lucide-react';
// type SuggestAssigneeInput, type SuggestAssigneeOutput no longer directly imported
// import { suggestAssignee, type SuggestAssigneeInput, type SuggestAssigneeOutput } from '@/ai/flows/suggest-assignee';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSession } from '@/components/auth/AppProviders';
import type { SuggestAssigneeOutput } from '@/ai/flows/suggest-assignee'; // Keep output type

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
  const { getAuthHeaders } = useSession();

  const handleSuggestAssignee = useCallback(async () => {
    if (!problemDescription.trim() || problemDescription.length < 20) {
      setError('Por favor, forneça uma descrição mais detalhada do problema (pelo menos 20 caracteres).');
      setSuggestion(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const response = await fetch('/api/ai/suggest-assignee', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(), // Add auth headers, though this API might be public
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problemDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: SuggestAssigneeOutput = await response.json();
      setSuggestion(result);
    } catch (err: any) {
      console.error('Erro ao sugerir responsável:', err);
      setError(err.message || 'Falha ao obter sugestão da IA. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [problemDescription, getAuthHeaders]);

  const handleAcceptSuggestion = () => {
    if (suggestion) {
      onSuggestionAccept(suggestion.assigneeEmail);
      setSuggestion(null); 
    }
  };

  return (
    <Card className="mt-4 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-headline">
          <Sparkles className="mr-2 h-5 w-5 text-accent" />
          Sugestão de Responsável (IA)
        </CardTitle>
        <CardDescription>
          Deixe a IA sugerir um responsável com base na descrição do problema.
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
          Sugerir Responsável
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestion && (
          <Alert variant="default" className="bg-primary/10 border-primary/30">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="font-headline text-primary">Sugestão da IA</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                <strong>Responsável:</strong> {suggestion.assigneeEmail}
              </p>
              <p>
                <strong>Motivo:</strong> {suggestion.reason}
              </p>
              {currentAssignee !== suggestion.assigneeEmail && (
                 <Button
                    onClick={handleAcceptSuggestion}
                    size="sm"
                    className="mt-2"
                    type="button"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Aceitar Sugestão
                  </Button>
              )}
             {currentAssignee === suggestion.assigneeEmail && (
                <p className="text-sm text-green-700 font-medium mt-2">Este responsável já está selecionado.</p>
             )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

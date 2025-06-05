
'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="max-w-md text-center bg-card p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-headline font-semibold text-destructive mb-4">
          Algo deu errado!
        </h2>
        <p className="text-muted-foreground mb-6">
          {error.message || "Ocorreu um erro inesperado. Por favor, tente novamente."}
        </p>
        <Button
          onClick={
            () => reset()
          }
          className="font-headline"
        >
          Tentar novamente
        </Button>
         <Button
          variant="link"
          onClick={() => window.location.href = '/dashboard'}
          className="mt-2"
        >
          Ir para o Painel
        </Button>
      </div>
    </div>
  );
}

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
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="max-w-md text-center bg-card p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-headline font-semibold text-destructive mb-4">
          Something went wrong!
        </h2>
        <p className="text-muted-foreground mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="font-headline"
        >
          Try again
        </Button>
         <Button
          variant="link"
          onClick={() => window.location.href = '/dashboard'}
          className="mt-2"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

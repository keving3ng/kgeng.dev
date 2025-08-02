'use client';

import { useEffect } from 'react';
import { Button } from '../components/ui/button';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">
            500
          </h1>
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Something went wrong
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => reset()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try again
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full border-slate-300 dark:border-slate-600"
          >
            Go home
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-slate-500 dark:text-slate-400 mb-2">
              Error details (development only)
            </summary>
            <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded overflow-auto">
              {error.message}
              {error.stack && '\n\nStack trace:\n' + error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
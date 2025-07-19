'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="max-w-md mx-auto text-center px-6">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-slate-900 mb-4">
                500
              </h1>
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">
                Application Error
              </h2>
              <p className="text-slate-600 mb-8">
                A global error occurred. Please refresh the page or contact support.
              </p>
            </div>
            
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mr-4"
            >
              Try again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
import * as Sentry from '@sentry/react';
import type { ReactNode } from 'react';

export function SentryErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">Something went wrong</h1>
            <p className="text-slate-500 text-sm">
              {error instanceof Error ? error.message : 'An unexpected error occurred.'}
            </p>
            <button
              onClick={resetError}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

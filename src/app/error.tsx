'use client';
import { useEffect } from 'react';
import { logClientError } from '@/lib/errorlogger';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    logClientError(error, {
      page: window.location.pathname,
      action: 'global_error_boundary',
    });
  }, [error]);

  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <button 
        onClick={reset}
        className="bg-primary text-white px-4 py-2 rounded"
      >
        Try again
      </button>
    </div>
  );
}
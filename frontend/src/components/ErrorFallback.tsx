// src/components/ErrorFallback.tsx
import React from "react";

type Props = {
  error: Error;
  resetErrorBoundary: () => void;
};

export function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <div role="alert" className="p-4 border rounded bg-red-50 text-red-700">
      <p className="font-semibold">Something went wrong:</p>
      <pre className="text-xs mt-2">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-3 px-3 py-1 bg-red-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}

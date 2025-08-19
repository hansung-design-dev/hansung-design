'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong!
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="space-x-4">
            <button
              onClick={reset}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

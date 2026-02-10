import { X } from 'lucide-react';
import { useEffect } from 'react';

import { useApiErrorStore } from '@/stores/useApiErrorStore';

export function ApiErrorBanner() {
  const { error, clearError } = useApiErrorStore();

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 8000);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between gap-4 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm"
      role="alert"
    >
      <span>
        {error.status && `[${error.status}] `}
        {error.message}
      </span>
      <button
        type="button"
        onClick={clearError}
        className="shrink-0 rounded p-1 text-red-600 hover:bg-red-100 hover:text-red-900"
        aria-label="닫기"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

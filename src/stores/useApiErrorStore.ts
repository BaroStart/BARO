import { create } from 'zustand';

export interface ApiError {
  message: string;
  status?: number;
  timestamp: number;
}

interface ApiErrorState {
  error: ApiError | null;
  setError: (message: string, status?: number) => void;
  clearError: () => void;
}

export const useApiErrorStore = create<ApiErrorState>((set) => ({
  error: null,
  setError: (message, status) =>
    set({
      error: {
        message,
        status,
        timestamp: Date.now(),
      },
    }),
  clearError: () => set({ error: null }),
}));

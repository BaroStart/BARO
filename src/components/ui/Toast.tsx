import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { create } from 'zustand';

import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

const useToastStore = create<{
  toasts: ToastItem[];
  add: (item: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
}>((set) => ({
  toasts: [],
  add: (item) =>
    set((s) => ({ toasts: [...s.toasts, { ...item, id: String(Date.now()) }] })),
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().add({ message, variant: 'success' }),
  error: (message: string) => useToastStore.getState().add({ message, variant: 'error' }),
  warning: (message: string) => useToastStore.getState().add({ message, variant: 'warning' }),
};

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500" />,
  error: <XCircle className="h-[18px] w-[18px] text-red-500" />,
  warning: <AlertCircle className="h-[18px] w-[18px] text-amber-500" />,
};

function ToastRow({ item }: { item: ToastItem }) {
  const remove = useToastStore((s) => s.remove);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 마운트 직후 slide-in 트리거
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      // fade-out 완료 후 제거
      setTimeout(() => remove(item.id), 300);
    }, 2700);
    return () => clearTimeout(timer);
  }, [item.id, remove]);

  return (
    <div
      className={cn(
        'flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3.5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] transition-all duration-300 ease-out',
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-2 opacity-0',
      )}
    >
      {ICONS[item.variant]}
      <p className="text-[13px] font-medium text-slate-800 leading-snug">{item.message}</p>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-0 left-1/2 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      {toasts.map((t) => (
        <ToastRow key={t.id} item={t} />
      ))}
    </div>,
    document.body,
  );
}

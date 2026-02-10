import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award } from 'lucide-react';

import { useBadgeCelebrationStore } from '@/stores/useBadgeCelebrationStore';

export function BadgeCelebrationOverlay() {
  const { show, badge, dismiss } = useBadgeCelebrationStore();

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(dismiss, 3000);
    return () => clearTimeout(t);
  }, [show, dismiss]);

  if (!show || !badge) return null;

  const FlyingBadge = ({ delay, x, size }: { delay: number; x: number; size: number }) => (
    <div
      className="pointer-events-none fixed z-[10001] animate-badge-fly"
      style={{
        left: `${x}%`,
        top: '50%',
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full bg-amber-400 text-amber-900 shadow-lg"
        style={{ width: size, height: size }}
      >
        <Award className="h-1/2 w-1/2" />
      </div>
    </div>
  );

  const overlay = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="animate-scale-in rounded-2xl bg-white p-6 text-center shadow-xl">
        <p className="text-sm font-bold text-amber-600">축하해요!</p>
        <p className="mt-2 text-lg font-extrabold text-gray-900">{badge.title}</p>
        {badge.subtitle && (
          <p className="mt-1 text-xs text-gray-500">{badge.subtitle}</p>
        )}
      </div>

      {[0, 0.2, 0.4, 0.6, 0.8].map((x, i) => (
        <FlyingBadge key={i} delay={i * 0.15} x={15 + x * 70} size={36 + i * 8} />
      ))}
    </div>
  );

  return createPortal(overlay, document.body);
}

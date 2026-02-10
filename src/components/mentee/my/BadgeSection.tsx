import { LockKeyhole } from 'lucide-react';
import { iconFor, type BadgeItem } from './badgeIcons';

export type { BadgeItem };

type Props = {
  title?: string;
  items: BadgeItem[];
  className?: string;
  onClickAll?: () => void;
  onBadgeClick?: (badge: BadgeItem) => void;
};

export function BadgeSection({
  title = '획득한 배지',
  items,
  className,
  onBadgeClick,
}: Props) {
  const shapeFor = (id: string): string => {
    if (id.includes('master')) return 'rounded-2xl';
    if (id.includes('attendance') || id.includes('streak')) return 'rounded-full';
    if (id.includes('first') || id.includes('100')) return 'rounded-xl';
    return 'rounded-full';
  };

  return (
    <section className={['', className ?? ''].join(' ').trim()}>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>

      <div className="grid grid-cols-4 gap-y-5 gap-x-3">
        {items.map((b) => {
          const shape = shapeFor(b.id);
          const acquiredCls = b.acquired
            ? 'border-2 border-slate-300 bg-slate-100 text-slate-700'
            : 'border-2 border-dashed border-slate-200 bg-slate-50 text-slate-300';

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onBadgeClick?.(b)}
              className="flex cursor-pointer flex-col items-center gap-2 text-left transition active:scale-95"
            >
              <div
                className={[
                  'flex h-14 w-14 flex-col items-center justify-center text-center transition cursor-pointer',
                  shape,
                  acquiredCls,
                ].join(' ')}
              >
                <div className="leading-none">
                  {b.acquired ? iconFor(b) : <LockKeyhole className="h-4 w-4" strokeWidth={2} />}
                </div>
              </div>

              <div className="text-center">
                <p
                  className={[
                    'text-[11px] font-semibold',
                    b.acquired ? 'text-slate-900' : 'text-slate-400',
                  ].join(' ')}
                >
                  {b.title}
                </p>
                {b.subtitle && (
                  <p
                    className={[
                      'text-[10px]',
                      b.acquired ? 'text-slate-600' : 'text-slate-300',
                    ].join(' ')}
                  >
                    {b.subtitle}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

import { GripVertical, Trash2 } from 'lucide-react';

import type { ScheduleItem } from '@/components/mentor/ScheduleCalendar';

export function ScheduleItemCard({
  item,
  onContextMenu,
  onDelete,
}: {
  item: ScheduleItem;
  onContextMenu: (e: React.MouseEvent) => void;
  onDelete: () => void;
}) {
  const typeLabel =
    item.type === 'learning' ? '자율학습' : item.type === 'personal' ? '개인' : item.subject;
  const typeBg =
    item.type === 'learning'
      ? 'bg-amber-50 text-amber-700'
      : item.type === 'personal'
        ? 'bg-violet-50 text-violet-700'
        : 'bg-sky-50 text-sky-700';
  const isCompleted = item.status === 'completed';

  return (
    <div
      onContextMenu={onContextMenu}
      className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors hover:bg-secondary/30 ${isCompleted ? 'border-border/20 bg-secondary/10 opacity-60' : 'border-border/40'}`}
    >
      <div className="flex shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-foreground/50">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={`truncate text-[13px] font-medium text-foreground ${isCompleted ? 'line-through' : ''}`}>
            {item.title}
          </p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${typeBg}`}>
            {typeLabel}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm(`"${item.title}"을(를) 삭제하시겠습니까?`)) onDelete();
        }}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600"
        title="삭제"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

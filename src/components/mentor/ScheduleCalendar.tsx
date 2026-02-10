import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export interface ScheduleItem {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  status?: 'default' | 'completed' | 'urgent';
  /** personal: 개인일정, learning: 자율학습 To-Do, feedback: 피드백대기, assignment: 과제 */
  type?: 'personal' | 'learning' | 'feedback' | 'assignment';
  /** feedback: assignmentId, assignment: id */
  sourceId?: string;
}

interface ScheduleCalendarProps {
  year: number;
  month: number;
  selectedDate: string | null;
  scheduleItems: ScheduleItem[];
  onDateSelect: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
  onItemClick?: (item: ScheduleItem) => void;
  onItemRightClick?: (e: React.MouseEvent, item: ScheduleItem) => void;
  onItemDelete?: (itemId: string) => void;
  onItemDragStart?: (item: ScheduleItem) => void;
  onItemDragEnd?: () => void;
  onDropOnDate?: (dateStr: string, isCopy: boolean) => void;
  draggedItemId?: string | null;
  searchQuery?: string;
  className?: string;
}

export function ScheduleCalendar({
  year,
  month,
  selectedDate,
  scheduleItems,
  onDateSelect,
  onMonthChange,
  onItemClick,
  onItemRightClick,
  onItemDelete,
  onItemDragStart,
  onItemDragEnd,
  onDropOnDate,
  draggedItemId,
  searchQuery = '',
  className,
}: ScheduleCalendarProps) {
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  useEffect(() => {
    if (!draggedItemId) setDragOverDate(null);
  }, [draggedItemId]);

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startPadding = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // 검색어로 필터링
  const filteredItems = searchQuery
    ? scheduleItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : scheduleItems;

  const getItemsForDate = (dateStr: string) =>
    filteredItems.filter((item) => item.date === dateStr);

  const handlePrevMonth = () => {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  };

  const handleNextMonth = () => {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  };

  const formatDate = (day: number) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < startPadding; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className={cn('rounded-lg border border-slate-200 bg-white p-3', className)}>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-slate-900">
          {year}년 {month}월
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-xs">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1 text-center font-medium text-slate-500">
            {day}
          </div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} className="min-h-[60px]" />;
          const dateStr = formatDate(day);
          const items = getItemsForDate(dateStr);
          const isSelected = selectedDate === dateStr;

          const isDropTarget = !!onDropOnDate && !!draggedItemId;
          const isHoveringDrop = isDropTarget && dragOverDate === dateStr;

          return (
            <div
              key={dateStr}
              className={cn(
                'min-h-[60px] cursor-pointer rounded border p-1 transition-colors',
                isSelected ? 'border-slate-800 bg-slate-50' : 'border-transparent hover:bg-slate-50',
                isHoveringDrop && 'border-slate-400 bg-amber-50 ring-2 ring-amber-300 ring-offset-1'
              )}
              onClick={() => onDateSelect(dateStr)}
              onDragOver={(e) => {
                if (isDropTarget) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = (e.ctrlKey || e.metaKey) ? 'copy' : 'move';
                  setDragOverDate(dateStr);
                }
              }}
              onDragLeave={() => setDragOverDate(null)}
              onDrop={(e) => {
                if (isDropTarget && onDropOnDate) {
                  e.preventDefault();
                  setDragOverDate(null);
                  const isCopy = e.ctrlKey || e.metaKey;
                  onDropOnDate(dateStr, isCopy);
                }
              }}
            >
              <span className="text-sm font-medium text-slate-700">{day}</span>
              <div className="mt-0.5 space-y-0.5">
                {items.slice(0, 2).map((item) => {
                  const canDrag = (item.type === 'personal' || item.type === 'learning') && !!onItemDragStart;
                  const canDelete = (item.type === 'personal' || item.type === 'learning') && !!onItemDelete;
                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      draggable={canDrag}
                      onDragStart={(e) => {
                        if (canDrag) {
                          e.dataTransfer.effectAllowed = 'copyMove';
                          e.dataTransfer.setData('text/plain', item.id);
                          onItemDragStart?.(item);
                        }
                      }}
                      onDragEnd={() => onItemDragEnd?.()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemClick?.(item);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onItemRightClick?.(e, item);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onItemClick?.(item);
                        }
                      }}
                      className={cn(
                        'group flex items-center gap-0.5 rounded px-1 py-0.5 text-left text-[10px] transition-colors',
                        item.type === 'learning' && (item.status === 'completed' ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'),
                        item.type === 'personal' && 'bg-violet-100 text-violet-800 hover:bg-violet-200',
                        item.type === 'feedback' && (item.status === 'urgent' ? 'bg-amber-200 text-amber-900 hover:bg-amber-300' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'),
                        item.type === 'assignment' && (item.status === 'urgent' ? 'bg-blue-200 text-blue-900 hover:bg-blue-300' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'),
                        !item.type && item.status === 'urgent' && 'bg-slate-800 text-white hover:bg-slate-700',
                        !item.type && item.status === 'completed' && 'bg-slate-200 text-slate-700 hover:bg-slate-300',
                        !item.type && (!item.status || item.status === 'default') && 'bg-slate-100 text-slate-800 hover:bg-slate-200',
                        canDrag && 'cursor-grab active:cursor-grabbing',
                        draggedItemId === item.id && 'opacity-50'
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`"${item.title}"을(를) 삭제하시겠습니까?`)) {
                              onItemDelete?.(item.id);
                            }
                          }}
                          className="shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                          title="삭제"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {items.length > 2 && (
                  <span className="block truncate px-1 text-[10px] text-slate-400">
                    +{items.length - 2}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

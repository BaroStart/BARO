import { useMemo } from 'react';

import { addDays, DAY_LABELS, getWeekDates, toYmdLocal } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}

export function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const todayKey = useMemo(() => toYmdLocal(new Date()), []);
  const selectedKey = toYmdLocal(selectedDate);
  const monthLabel = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`;

  return (
    <div className="border-b border-slate-100 bg-white px-4 pt-4 pb-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => onSelectDate(addDays(selectedDate, -7))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="이전 주"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <path
              d="M10 4L6 8l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="text-sm font-semibold text-slate-700">{monthLabel}</span>
        <button
          type="button"
          onClick={() => onSelectDate(addDays(selectedDate, 7))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="다음 주"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between gap-1">
        {weekDates.map((d) => {
          const key = toYmdLocal(d);
          const isSelected = key === selectedKey;
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(d)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition-colors',
                isSelected && 'bg-slate-100',
              )}
            >
              <span
                className={cn(
                  'text-[11px] font-medium',
                  isSelected
                    ? 'text-slate-700'
                    : d.getDay() === 0
                      ? 'text-rose-400'
                      : 'text-slate-400',
                )}
              >
                {DAY_LABELS[d.getDay()]}
              </span>
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold',
                  isSelected
                    ? 'bg-slate-800 text-white'
                    : isToday
                      ? 'text-slate-800 ring-2 ring-slate-200'
                      : 'text-slate-600',
                )}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

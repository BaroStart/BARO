import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarProps {
  year: number;
  month: number;
  selectedDate: string | null; // YYYY-MM-DD
  highlightDates?: string[]; // YYYY-MM-DD - dates with assignments
  onDateSelect: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
  className?: string;
  todayDate?: string;
}

export function Calendar({
  year,
  month,
  selectedDate,
  highlightDates = [],
  onDateSelect,
  onMonthChange,
  className,
  todayDate,
}: CalendarProps) {
  const today = new Date();
  const defaultTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayStr = todayDate ?? defaultTodayStr;

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startPadding = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  const formatDate = (day: number) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  return (
    <div
      className={cn(
        'min-w-[320px] rounded-2xl border border-slate-100 bg-white p-5 shadow-sm',
        className,
      )}
    >
      {/* 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-base font-semibold tracking-tight text-slate-800">
          {year}년 {month}월
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* 요일 */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={cn(
              'flex h-10 w-10 items-center justify-center text-sm font-medium',
              i === 0 ? 'text-slate-400' : i === 6 ? 'text-slate-400' : 'text-slate-500',
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-10 w-10" />;
          }
          const dateStr = formatDate(day);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === todayStr;
          const hasAssignment = highlightDates.includes(dateStr);
          const dayOfWeek = (startPadding + (day - 1)) % 7;
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onDateSelect(dateStr)}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-150',
                isSelected && 'bg-slate-800 text-white shadow-md',
                !isSelected && isToday && 'ring-1 ring-slate-300 ring-offset-2 text-slate-900',
                !isSelected &&
                  !isToday &&
                  hasAssignment &&
                  'bg-slate-100 text-slate-800 hover:bg-slate-200',
                !isSelected && !isToday && !hasAssignment && 'text-slate-600 hover:bg-slate-50',
                isWeekend && !isSelected && 'text-slate-400',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

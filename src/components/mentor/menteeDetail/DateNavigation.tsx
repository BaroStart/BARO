import { ChevronLeft, ChevronRight } from 'lucide-react';

import { DatePicker } from '@/components/ui/date-picker';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { formatDisplayDate, formatMonthOnly, formatWeekRange } from '@/lib/dateUtils';

export function DateNavigation({
  selectedDate,
  viewMode,
  dateRange,
  onDateChange,
  onPrev,
  onNext,
  onViewModeChange,
}: {
  selectedDate: string;
  viewMode: 'today' | 'week' | 'month';
  dateRange: { start: string; end: string };
  onDateChange: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onViewModeChange: (mode: 'today' | 'week' | 'month') => void;
}) {
  const getDisplayText = () => {
    if (viewMode === 'week') return formatWeekRange(dateRange.start, dateRange.end);
    if (viewMode === 'month') return formatMonthOnly(selectedDate);
    return formatDisplayDate(selectedDate);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-white px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="min-w-0 flex-1 text-center text-base font-semibold text-foreground sm:min-w-[280px] sm:flex-none">
          {getDisplayText()}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <DatePicker
          value={selectedDate}
          onChange={onDateChange}
          placeholder="날짜 선택"
          className="ml-1"
          hideValue
        />
      </div>
      <FilterTabs
        items={[
          { id: 'today' as const, label: '오늘' },
          { id: 'week' as const, label: '주간 보기' },
          { id: 'month' as const, label: '월간 보기' },
        ]}
        value={viewMode}
        onChange={onViewModeChange}
      />
    </div>
  );
}

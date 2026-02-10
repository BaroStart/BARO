import * as React from 'react';

import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  hideValue?: boolean;
  todayDate?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = '날짜 선택',
  className,
  hideValue = false,
  todayDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // 현재 보여줄 연/월 상태 (선택된 날짜 기준 또는 오늘)
  const [viewDate, setViewDate] = React.useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      return { year: y, month: m };
    }
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  });

  // value가 변경되면 viewDate도 업데이트
  React.useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      setViewDate({ year: y, month: m });
    }
  }, [value]);

  const handleDateSelect = (date: string) => {
    onChange?.(date);
    setOpen(false);
  };

  const handleMonthChange = (year: number, month: number) => {
    setViewDate({ year, month });
  };

  // 날짜 포맷팅: 2025년 2월 5일
  const formatDisplayDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return `${y}년 ${m}월 ${d}일`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          icon={CalendarIcon}
          className={cn(
            'h-10 w-full justify-start text-left font-normal sm:max-w-[200px]',
            (!value || hideValue) && 'text-muted-foreground',
            className,
          )}
        >
          {value && !hideValue ? formatDisplayDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          year={viewDate.year}
          month={viewDate.month}
          selectedDate={value ?? null}
          onDateSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
          className="border-0 shadow-none"
          todayDate={todayDate}
        />
      </PopoverContent>
    </Popover>
  );
}

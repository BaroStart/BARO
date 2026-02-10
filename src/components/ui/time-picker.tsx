import * as React from 'react';

import { Clock } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

// 가장 가까운 분 옵션 찾기
function findClosestMinute(minute: string): string {
  const m = parseInt(minute, 10);
  if (m < 8) return '00';
  if (m < 23) return '15';
  if (m < 38) return '30';
  if (m < 53) return '45';
  return '00';
}

export function TimePicker({ value, onChange, placeholder = '시간 선택', className }: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedHour, selectedMinute] = React.useMemo(() => {
    if (!value) return ['23', '00'];
    const [h, m] = value.split(':');
    const hour = h || '23';
    const minute = findClosestMinute(m || '00');
    return [hour, minute];
  }, [value]);

  const handleTimeSelect = (hour: string, minute: string) => {
    const newTime = `${hour}:${minute}`;
    onChange?.(newTime);
    setOpen(false);
  };

  const formatDisplayTime = (time: string | undefined) => {
    if (!time) return placeholder;
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const period = hour < 12 ? '오전' : '오후';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${period} ${displayHour}:${m}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          icon={Clock}
          className={cn(
            'h-10 w-full justify-start text-left font-normal sm:max-w-[160px]',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          {formatDisplayTime(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex h-[240px] min-w-[160px]">
          {/* Hour column */}
          <div className="flex w-20 flex-col border-r border-slate-200">
            <div className="border-b border-slate-200 px-3 py-2.5 text-center text-sm font-medium text-slate-700">
              시
            </div>
            <div className="flex-1 overflow-y-auto">
              {HOURS.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => handleTimeSelect(hour, selectedMinute)}
                  className={cn(
                    'w-full px-4 py-2 text-sm transition-colors hover:bg-slate-100',
                    selectedHour === hour && 'bg-slate-800 text-white hover:bg-slate-800',
                  )}
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>
          {/* Minute column */}
          <div className="flex w-20 flex-col">
            <div className="border-b border-slate-200 px-3 py-2.5 text-center text-sm font-medium text-slate-700">
              분
            </div>
            <div className="flex-1 overflow-y-auto">
              {MINUTES.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  onClick={() => handleTimeSelect(selectedHour, minute)}
                  className={cn(
                    'w-full px-4 py-2 text-sm transition-colors hover:bg-slate-100',
                    selectedMinute === minute && 'bg-slate-800 text-white hover:bg-slate-800',
                  )}
                >
                  {minute}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/** 월~일 순서 (월요일 시작) */
const DAYS = [
  { label: '월', index: 1 },
  { label: '화', index: 2 },
  { label: '수', index: 3 },
  { label: '목', index: 4 },
  { label: '금', index: 5 },
  { label: '토', index: 6 },
  { label: '일', index: 0 },
];

interface WeekdaySelectorProps {
  /** 선택된 요일 인덱스 (0=일, 1=월, ... 6=토) */
  value: number[];
  onChange: (days: number[]) => void;
  className?: string;
}

export function WeekdaySelector({ value, onChange, className }: WeekdaySelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragHoverIndex, setDragHoverIndex] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');
  const dragStartRef = useRef<number | null>(null);
  const dragModeRef = useRef<'add' | 'remove'>('add');

  const isSelected = useCallback(
    (index: number) => value.includes(index),
    [value]
  );

  const toggleDay = useCallback(
    (index: number) => {
      if (value.includes(index)) {
        onChange(value.filter((d) => d !== index));
      } else {
        onChange([...value, index].sort((a, b) => a - b));
      }
    },
    [value, onChange]
  );

  const selectRange = useCallback(
    (from: number, to: number, mode: 'add' | 'remove') => {
      const min = Math.min(from, to);
      const max = Math.max(from, to);
      const range: number[] = [];
      for (let i = 0; i <= 6; i++) {
        if (i >= min && i <= max) range.push(i);
      }
      if (mode === 'add') {
        const newValue = [...new Set([...value, ...range])].sort((a, b) => a - b);
        onChange(newValue);
      } else {
        const newValue = value.filter((d) => !range.includes(d)).sort((a, b) => a - b);
        onChange(newValue);
      }
    },
    [value, onChange]
  );

  const handlePointerDown = (index: number) => {
    const mode = value.includes(index) ? 'remove' : 'add';
    setIsDragging(true);
    setDragMode(mode);
    dragModeRef.current = mode;
    dragStartRef.current = index;
    setDragHoverIndex(index);
    toggleDay(index);
  };

  const handlePointerEnter = (index: number) => {
    if (isDragging && dragStartRef.current !== null) {
      setDragHoverIndex(index);
      selectRange(dragStartRef.current, index, dragModeRef.current);
    }
  };

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragHoverIndex(null);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    const up = () => handlePointerUp();
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [handlePointerUp]);

  /** 드래그 중 범위 내 셀 표시용 */
  const isInDragRange = (index: number) => {
    if (!isDragging || dragStartRef.current === null || dragHoverIndex === null) return false;
    const min = Math.min(dragStartRef.current, dragHoverIndex);
    const max = Math.max(dragStartRef.current, dragHoverIndex);
    return index >= min && index <= max;
  };

  return (
    <div
      className={cn(
        'inline-flex select-none overflow-hidden rounded-lg border border-slate-200 bg-white',
        isDragging && 'ring-2 ring-slate-300 ring-offset-1',
        className
      )}
      onMouseUp={handlePointerUp}
    >
      {DAYS.map((day, i) => (
        <button
          key={day.index}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handlePointerDown(day.index);
          }}
          onMouseEnter={() => handlePointerEnter(day.index)}
          data-weekday-index={day.index}
          className={cn(
            'flex h-10 min-w-[2.5rem] flex-1 items-center justify-center text-sm font-medium transition-colors',
            i === 0 && 'rounded-l-md',
            i === DAYS.length - 1 && 'rounded-r-md',
            'border-r border-slate-200 last:border-r-0',
            isSelected(day.index)
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50',
            isInDragRange(day.index) &&
              !isSelected(day.index) &&
              dragMode === 'add' &&
              'bg-slate-200',
            isInDragRange(day.index) &&
              isSelected(day.index) &&
              dragMode === 'remove' &&
              'bg-slate-600'
          )}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}

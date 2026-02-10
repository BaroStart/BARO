// TODO: 삭제 예정
import { useEffect, useState } from 'react';

import { X } from 'lucide-react';

import { Calendar } from '@/components/ui/Calendar';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null;
  highlightDates?: string[];
  onDateSelect: (date: string) => void;
}

export function DatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  highlightDates = [],
  onDateSelect,
}: DatePickerModalProps) {
  const today = new Date();
  const [year, setYear] = useState(
    selectedDate ? parseInt(selectedDate.split('-')[0], 10) : today.getFullYear(),
  );
  const [month, setMonth] = useState(
    selectedDate ? parseInt(selectedDate.split('-')[1], 10) : today.getMonth() + 1,
  );

  useEffect(() => {
    if (isOpen && selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      setYear(y);
      setMonth(m);
    }
  }, [isOpen, selectedDate]);

  const handleSelect = (date: string) => {
    onDateSelect(date);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">날짜 선택</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Calendar
          year={year}
          month={month}
          selectedDate={selectedDate}
          highlightDates={highlightDates}
          onDateSelect={handleSelect}
          onMonthChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />
      </div>
    </div>
  );
}

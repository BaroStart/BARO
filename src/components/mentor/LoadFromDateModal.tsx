import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Calendar } from '@/components/ui/Calendar';

interface LoadFromDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string | null;
  highlightDates?: string[];
  onConfirm: (date: string) => void;
}

export function LoadFromDateModal({
  isOpen,
  onClose,
  selectedDate,
  highlightDates = [],
  onConfirm,
}: LoadFromDateModalProps) {
  const today = new Date();
  const [year, setYear] = useState(
    selectedDate ? parseInt(selectedDate.split('-')[0], 10) : today.getFullYear()
  );
  const [month, setMonth] = useState(
    selectedDate ? parseInt(selectedDate.split('-')[1], 10) : today.getMonth() + 1
  );
  const [pickedDate, setPickedDate] = useState<string | null>(selectedDate);

  useEffect(() => {
    if (isOpen && selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      setYear(y);
      setMonth(m);
      setPickedDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

  const handleConfirm = () => {
    if (pickedDate) {
      onConfirm(pickedDate);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">이전 날짜 계획 불러오기</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          불러올 날짜를 선택하세요. 해당 날짜의 과제 계획이 폼에 채워집니다.
        </p>
        <Calendar
          year={year}
          month={month}
          selectedDate={pickedDate}
          highlightDates={highlightDates}
          onDateSelect={setPickedDate}
          onMonthChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!pickedDate}
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            불러오기
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { SUBJECTS } from '@/data/menteeDetailMock';

/** 개인 일정 유형 */
export const PERSONAL_SCHEDULE_TYPES = [
  { value: 'midterm', label: '중간고사' },
  { value: 'final', label: '기말고사' },
  { value: 'mock', label: '모의고사' },
  { value: 'performance', label: '수행평가' },
  { value: 'other', label: '기타' },
] as const;

const SUBJECT_OPTIONS = SUBJECTS.filter((s) => s !== '전체');

export interface PersonalScheduleData {
  title: string;
  eventType: (typeof PERSONAL_SCHEDULE_TYPES)[number]['value'];
  date: string;
}

export interface LearningTaskData {
  title: string;
  subject: string;
  date: string;
}

export type ScheduleAddMode = 'personal' | 'learning';

interface ScheduleAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string;
  mode?: ScheduleAddMode;
  onSubmitPersonal?: (data: PersonalScheduleData) => void;
  onSubmitLearning?: (data: LearningTaskData) => void;
}

export function ScheduleAddModal({
  isOpen,
  onClose,
  defaultDate,
  mode: initialMode = 'learning',
  onSubmitPersonal,
  onSubmitLearning,
}: ScheduleAddModalProps) {
  const [mode, setMode] = useState<ScheduleAddMode>(initialMode);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<(typeof PERSONAL_SCHEDULE_TYPES)[number]['value']>('midterm');
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0]);
  const [date, setDate] = useState(defaultDate);

  useEffect(() => {
    if (isOpen) {
      setDate(defaultDate);
      setTitle('');
      setMode(initialMode);
    }
  }, [isOpen, defaultDate, initialMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    if (mode === 'personal' && onSubmitPersonal) {
      onSubmitPersonal({ title: trimmed, eventType, date });
    } else if (mode === 'learning' && onSubmitLearning) {
      onSubmitLearning({ title: trimmed, subject, date });
    }
    setTitle('');
    setDate(defaultDate);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden />
      <div className="relative z-10 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('learning')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'learning' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            자율학습 To-Do
          </button>
          <button
            type="button"
            onClick={() => setMode('personal')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'personal' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            개인 일정
          </button>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">
          {mode === 'learning' ? '자율학습 To-Do 추가' : '개인 일정 추가'}
        </h3>
        <p className="mb-4 text-sm text-slate-500">
          {mode === 'learning'
            ? '수학 오답노트 정리, 영어 듣기 평가 등 학습 할 일을 등록하세요.'
            : '중간고사, 기말고사, 모의고사 등 개인 일정을 등록하세요.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'learning' ? (
            <div>
              <Label htmlFor="schedule-subject">과목</Label>
              <select
                id="schedule-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value as (typeof SUBJECT_OPTIONS)[number])}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <Label htmlFor="schedule-type">일정 유형</Label>
              <select
                id="schedule-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as (typeof PERSONAL_SCHEDULE_TYPES)[number]['value'])}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {PERSONAL_SCHEDULE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Input
            id="schedule-title"
            label="제목"
            placeholder={mode === 'learning' ? '예: 수학 오답노트 정리, 영어 듣기 평가' : '예: 1학기 중간고사, 6월 모의고사'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            id="schedule-date"
            label="날짜"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={!title.trim()}>
              추가
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

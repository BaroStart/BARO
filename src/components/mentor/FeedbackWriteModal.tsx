import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { X } from 'lucide-react';

import { fetchFeedbackListByMentor } from '@/api/feedback';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Label } from '@/components/ui/Label';
import { DefaultSelect } from '@/components/ui/select';
import type { FeedbackListItemRes } from '@/generated';
import { formatDateTime } from '@/lib/dateUtils';
import { getSubjectLabel } from '@/lib/subjectLabels';

interface FeedbackWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMenteeId?: string;
  initialAssignmentId?: string;
}

function parseDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function FeedbackWriteModal({
  isOpen,
  onClose,
  initialMenteeId: _initialMenteeId,
  initialAssignmentId: _initialAssignmentId,
}: FeedbackWriteModalProps) {
  const navigate = useNavigate();
  const [feedbackList, setFeedbackList] = useState<FeedbackListItemRes[]>([]);
  const [menteeName, setMenteeName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [assignmentId, setAssignmentId] = useState<string>('');
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1);

  // 피드백 목록 API 로드
  useEffect(() => {
    if (!isOpen) return;
    fetchFeedbackListByMentor()
      .then(setFeedbackList)
      .catch(() => setFeedbackList([]));
  }, [isOpen]);

  // 대기 중인 과제만 필터
  const waitingItems = useMemo(
    () => feedbackList.filter((f) => f.status === 'WAITING'),
    [feedbackList],
  );

  // 멘티 목록 (고유 이름)
  const menteeOptions = useMemo(() => {
    const names = Array.from(new Set(waitingItems.map((f) => f.menteeName).filter(Boolean))) as string[];
    return names.sort().map((name) => ({ value: name, label: name }));
  }, [waitingItems]);

  // 필터링된 과제
  const filteredAssignments = useMemo(() => {
    let result = waitingItems;
    if (menteeName) {
      result = result.filter((f) => f.menteeName === menteeName);
    }
    if (date) {
      result = result.filter((f) => parseDate(f.submittedAt) === date);
    }
    if (subject) {
      result = result.filter((f) => getSubjectLabel(f.subject) === subject);
    }
    return result;
  }, [waitingItems, menteeName, date, subject]);

  // 캘린더 하이라이트 날짜
  const highlightDates = useMemo(() => {
    const items = menteeName
      ? waitingItems.filter((f) => f.menteeName === menteeName)
      : waitingItems;
    return items.map((f) => parseDate(f.submittedAt)).filter(Boolean);
  }, [waitingItems, menteeName]);

  // 과목 옵션
  const subjectOptions = useMemo(() => {
    const items = menteeName
      ? waitingItems.filter((f) => f.menteeName === menteeName)
      : waitingItems;
    const subjects = Array.from(new Set(items.map((f) => getSubjectLabel(f.subject)).filter(Boolean)));
    return subjects.sort().map((s) => ({ value: s, label: s }));
  }, [waitingItems, menteeName]);

  // 과제 옵션
  const assignmentOptions = useMemo(
    () =>
      filteredAssignments.map((f) => ({
        value: String(f.assignmentId),
        label: `${f.assignmentTitle ?? '과제'} (${formatDateTime(f.submittedAt)})`,
      })),
    [filteredAssignments],
  );

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setMenteeName('');
      setDate('');
      setSubject('');
      setAssignmentId('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!assignmentId) return;
    onClose();
    navigate(`/mentor/feedback/${assignmentId}`);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">피드백 작성</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {/* 멘티 선택 */}
          <div className="space-y-2">
            <Label>멘티</Label>
            <DefaultSelect
              value={menteeName}
              onValueChange={setMenteeName}
              options={menteeOptions}
              placeholder="멘티를 선택하세요"
            />
          </div>

          {/* 날짜 선택 - 달력 */}
          <div className="space-y-2">
            <Label>날짜</Label>
            <Calendar
              year={calendarYear}
              month={calendarMonth}
              selectedDate={date || null}
              highlightDates={highlightDates}
              onDateSelect={setDate}
              onMonthChange={(y, m) => {
                setCalendarYear(y);
                setCalendarMonth(m);
              }}
            />
          </div>

          {/* 과목 선택 */}
          <div className="space-y-2">
            <Label>과목</Label>
            <DefaultSelect
              value={subject}
              onValueChange={setSubject}
              options={subjectOptions}
              placeholder="과목을 선택하세요"
            />
          </div>

          {/* 과제명 선택 */}
          <div className="space-y-2">
            <Label>과제명</Label>
            <DefaultSelect
              value={assignmentId}
              onValueChange={setAssignmentId}
              options={assignmentOptions}
              placeholder="과제를 선택하세요"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!assignmentId}>
            피드백 작성하기
          </Button>
        </div>
      </div>
    </div>
  );
}

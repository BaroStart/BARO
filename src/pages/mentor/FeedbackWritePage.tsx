import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Calculator,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  Hexagon,
  Maximize2,
  Plus,
  RotateCcw,
  RotateCw,
  Star,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import { AuthPhotoViewer } from '@/components/mentor/AuthPhotoViewer';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { Calendar as CalendarComponent } from '@/components/ui/Calendar';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { toast } from '@/components/ui/Toast';
import { useAssignmentDetail } from '@/hooks/useAssignmentDetail';
import { useMentee } from '@/hooks/useMentee';
import { useSubmittedAssignments } from '@/hooks/useSubmittedAssignments';
import {
  fetchFeedbackTemplateDetail,
  fetchFeedbackTemplateList,
} from '@/api/feedbackTemplates';
import type { FeedbackTemplateListRes } from '@/generated';
import { formatRemainingTime, getDeadlineStatus, getRemainingMs } from '@/lib/feedbackDeadline';
import type { FeedbackItem } from '@/lib/mentorFeedbackStorage';
import { getGradeLabel } from '@/lib/gradeLabels';
import { getSubjectLabel } from '@/lib/subjectLabels';
import { getMentorFeedback, saveMentorFeedback } from '@/lib/mentorFeedbackStorage';
import { cn } from '@/lib/utils';
import type { FeedbackItemData } from '@/types';

const SUBJECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  국어: BookOpen,
  영어: FileText,
  수학: Calculator,
  공통: Hexagon,
};

function parseDateFromSubmittedAt(submittedAt: string): string {
  const match = submittedAt.match(/^(\d{4})\.(\d{2})\.(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  return new Date().toISOString().slice(0, 10);
}

export function FeedbackWritePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { menteeId, assignmentId } = useParams<{
    menteeId: string;
    assignmentId: string;
  }>();
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItemData[]>([
    { id: '1', text: '', isImportant: false },
    { id: '2', text: '', isImportant: true },
    { id: '3', text: '', isImportant: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [assignmentDropdownOpen, setAssignmentDropdownOpen] = useState(false);
  const [calendarView, setCalendarView] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  });

  const { data: assignmentDetail } = useAssignmentDetail(menteeId, assignmentId);
  const { data: mentee } = useMentee(menteeId);
  const { data: submittedAssignments = [] } = useSubmittedAssignments(menteeId);
  const assignmentFromList = submittedAssignments.find(
    (a) => a.menteeId === menteeId && a.id === assignmentId,
  );

  // 피드백 마감(다음날 11시) 남은 시간 갱신
  useEffect(() => {
    if (!assignmentFromList?.submittedAt) {
      setRemainingTime('');
      return;
    }
    const update = () =>
      setRemainingTime(formatRemainingTime(getRemainingMs(assignmentFromList.submittedAt)));
    update();
    const id = setInterval(update, 60000); // 1분마다 갱신
    return () => clearInterval(id);
  }, [assignmentFromList?.submittedAt]);

  const title = assignmentDetail?.title ?? assignmentFromList?.title ?? '과제';
  const subject = (assignmentDetail?.subject ?? assignmentFromList?.subject ?? '') as
    | '국어'
    | '영어'
    | '수학'
    | '공통';
  const photos = assignmentDetail?.studentPhotos ?? [];
  const displayPhotos =
    photos.length > 0
      ? photos
      : [{ id: 'student-notebook', url: '/student-notebook.jpg', caption: 'student-notebook.jpg' }];
  // 피드백 템플릿 목록 (API)
  const [templates, setTemplates] = useState<FeedbackTemplateListRes[]>([]);
  useEffect(() => {
    fetchFeedbackTemplateList().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  // 날짜: 선택된 날짜 또는 현재 과제 제출일
  const displayDate =
    selectedDate ??
    (assignmentFromList
      ? parseDateFromSubmittedAt(assignmentFromList.submittedAt)
      : new Date().toISOString().slice(0, 10));
  const displayDateFormatted = displayDate.replace(/-/g, '.');
  const assignmentsForDate = useMemo(
    () =>
      submittedAssignments.filter((a) => parseDateFromSubmittedAt(a.submittedAt) === displayDate),
    [submittedAssignments, displayDate],
  );

  // 기존 피드백 또는 기본 템플릿 로드
  useEffect(() => {
    if (!menteeId || !assignmentId) return;
    const stored = getMentorFeedback(menteeId, assignmentId);
    if (stored?.feedbackItems?.length) {
      setFeedbackItems(
        stored.feedbackItems.map((item, idx) => ({
          id: item.id || String(idx + 1),
          text: item.text,
          isImportant: item.isImportant,
        })),
      );

      return;
    }
    if (stored?.feedbackText) {
      setFeedbackItems([{ id: '1', text: stored.feedbackText, isImportant: false }]);

    }
  }, [menteeId, assignmentId, subject]);

  const handleLoadTemplate = useCallback(async (templateId: number) => {
    const detail = await fetchFeedbackTemplateDetail(templateId);
    if (!detail?.content) return;
    setFeedbackItems((prev) => {
      const newItems = [...prev];
      if (newItems.length > 0) {
        newItems[0] = { ...newItems[0], text: detail.content! };
      } else {
        newItems.push({ id: '1', text: detail.content!, isImportant: false });
      }
      return newItems;
    });
    setTemplateModalOpen(false);
  }, []);

  const handleAddFeedbackItem = useCallback(() => {
    setFeedbackItems((prev) => [...prev, { id: String(Date.now()), text: '', isImportant: false }]);
  }, []);

  const handleRemoveFeedbackItem = useCallback((id: string) => {
    setFeedbackItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleUpdateFeedbackItem = useCallback((id: string, updates: Partial<FeedbackItemData>) => {
    setFeedbackItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }, []);

  const handleTempSave = useCallback(async () => {
    if (!menteeId || !assignmentId) return;
    setSaving(true);
    try {
      const items: FeedbackItem[] = feedbackItems.map((item) => ({
        id: item.id,
        text: item.text,
        isImportant: item.isImportant,
      }));
      const feedbackText = feedbackItems.map((i) => i.text).join('\n\n');
      saveMentorFeedback({
        menteeId,
        assignmentId,
        feedbackText,
        feedbackItems: items,
        status: 'partial',
        progress: 50,
        feedbackDate: new Date().toLocaleString('ko-KR'),
        isDraft: true,
      });
      queryClient.invalidateQueries({ queryKey: ['feedbackItems', menteeId] });
      toast.success('임시 저장되었습니다.');
    } finally {
      setSaving(false);
    }
  }, [menteeId, assignmentId, feedbackItems, queryClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentId) return;
    const numericId = Number(assignmentId);
    if (Number.isNaN(numericId)) {
      toast.error('유효하지 않은 과제 ID입니다. 피드백 목록에서 다시 접근해 주세요.');
      return;
    }
    const hasContent = feedbackItems.some((item) => item.text.trim());
    if (!hasContent) {
      toast.warning('피드백 내용을 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      const content = feedbackItems.map((i) => i.text).join('\n\n');
      const importantItems = feedbackItems.filter((i) => i.isImportant && i.text.trim());
      const summary = importantItems.length > 0
        ? importantItems.map((i) => i.text).join('\n\n')
        : undefined;
      const { createFeedback } = await import('@/api/feedback');
      await createFeedback(numericId, content, summary);
      queryClient.invalidateQueries({ queryKey: ['submittedAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['feedbackItems', menteeId] });
      queryClient.invalidateQueries({ queryKey: ['mentees'] });
      toast.success('피드백이 저장되었습니다.');
      window.history.back();
    } catch (err) {
      console.error(err);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  if (!assignmentId) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <p className="text-muted-foreground">잘못된 경로입니다.</p>
        <Link to="/mentor/feedback" className="mt-4 text-sm text-foreground/70 underline">
          피드백 관리로 돌아가기
        </Link>
      </div>
    );
  }

  // 요일 표시
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dateObj = new Date(displayDate);
  const dayName = dayNames[dateObj.getDay()];

  return (
    <div className="-m-4 flex h-[calc(100vh-4rem)] flex-col bg-secondary/30 sm:-m-6">
      <div className="flex shrink-0 items-center gap-4 border-b border-border/50 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <span className="text-sm font-medium text-foreground/70">
              {mentee?.name?.[0] ?? '?'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{mentee?.name ?? '멘티'}</p>
            <p className="text-xs text-muted-foreground">
              {mentee?.grade ? getGradeLabel(mentee.grade) : '고3'} · {mentee?.track ?? '이과'}
            </p>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setDatePickerOpen((o) => !o)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              datePickerOpen
                ? 'bg-secondary text-foreground'
                : 'bg-secondary text-foreground/80 hover:bg-secondary/80',
            )}
          >
            <Calendar className="h-4 w-4" />
            {displayDateFormatted} ({dayName})
          </button>
          {datePickerOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDatePickerOpen(false)}
                aria-hidden
              />
              <div className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-border/50 bg-white p-3 shadow-lg">
                <CalendarComponent
                  year={calendarView.year}
                  month={calendarView.month}
                  selectedDate={displayDate}
                  onDateSelect={(date) => {
                    handleDateSelect(date);
                    setDatePickerOpen(false);
                  }}
                  onMonthChange={(year, month) => setCalendarView({ year, month })}
                />
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setAssignmentDropdownOpen((o) => !o)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              assignmentDropdownOpen
                ? 'bg-secondary text-foreground'
                : 'bg-secondary text-foreground/80 hover:bg-secondary/80',
            )}
          >
            <FileText className="h-4 w-4" />
            <span className="max-w-[200px] truncate">{title}</span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', assignmentDropdownOpen && 'rotate-180')}
            />
          </button>
          {assignmentDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setAssignmentDropdownOpen(false)}
                aria-hidden
              />
              <div className="absolute left-0 top-full z-50 mt-1 max-h-60 min-w-[280px] overflow-y-auto rounded-lg border border-border/50 bg-white py-1 shadow-lg">
                {assignmentsForDate.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                    해당 날짜에 제출된 과제가 없습니다
                  </p>
                ) : (
                  assignmentsForDate.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setAssignmentDropdownOpen(false);
                        if (a.id !== assignmentId && menteeId) {
                          navigate(`/mentor/mentees/${menteeId}/feedback/${a.id}`);
                        }
                      }}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm transition-colors',
                        a.id === assignmentId
                          ? 'bg-secondary font-medium text-foreground'
                          : 'text-foreground/80 hover:bg-secondary/50',
                      )}
                    >
                      <span className="block truncate">{a.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {a.subject} · {a.submittedAt}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {assignmentFromList?.submittedAt && remainingTime && (
          <div
            className={cn(
              'ml-auto flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
              getDeadlineStatus(assignmentFromList.submittedAt) === 'overdue'
                ? 'bg-red-100 text-red-700'
                : getDeadlineStatus(assignmentFromList.submittedAt) === 'urgent'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-secondary text-foreground/70',
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {getDeadlineStatus(assignmentFromList.submittedAt) === 'overdue'
              ? '마감 초과'
              : `마감 ${remainingTime} 전`}
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
        <div className="flex w-1/2 min-w-[400px] flex-col border-r border-border/50 bg-slate-800">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-300">인증 사진 뷰어</span>
              {displayPhotos.length > 0 && (
                <div className="flex items-center gap-1 rounded bg-slate-700 px-2 py-0.5">
                  <span className="text-xs text-slate-300">
                    {displayPhotos[0]?.caption ||
                      displayPhotos[0]?.url?.split('/').pop() ||
                      '국어_과제1.jpg'}
                  </span>
                </div>
              )}
            </div>
            {/* TODO: 줌/회전/전체화면 버튼 onClick 핸들러 미구현 */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                title="축소"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs text-slate-400">100%</span>
              <button
                type="button"
                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                title="확대"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                title="회전"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                title="전체 화면"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            <AuthPhotoViewer photos={displayPhotos} className="h-full w-full" darkMode />
          </div>
        </div>

        <div className="flex min-h-0 w-1/2 min-w-[400px] flex-1 flex-col bg-white">
          <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 py-3">
            <h2 className="text-base font-semibold text-foreground">피드백 등록</h2>
            <div className="flex items-center gap-2">
              {/* TODO: "이전 피드백 보기" 버튼 onClick 핸들러 미구현 */}
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-secondary/50"
              >
                <RotateCcw className="h-4 w-4" />
                이전 피드백 보기
              </button>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-secondary/50"
              >
                <FileText className="h-4 w-4" />
                템플릿 불러오기
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const SubjectIcon = SUBJECT_ICONS[subject] ?? Hexagon;
                    return (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground/70">
                        <SubjectIcon className="h-3.5 w-3.5" />
                        {subject || '국어'}
                      </span>
                    );
                  })()}
                </div>
                <span className="text-sm text-muted-foreground">{displayDateFormatted}</span>
              </div>

              <div className="space-y-4">
                {feedbackItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border/50 bg-white p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground/80">
                        피드백 항목 {index + 1}
                      </label>
                      {feedbackItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeedbackItem(item.id)}
                          className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground/70"
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <RichTextEditor
                      content={item.text}
                      onChange={(html) => handleUpdateFeedbackItem(item.id, { text: html })}
                      placeholder="구체적이고 건설적인 피드백을 작성해주세요..."
                      className="mb-3"
                    />
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground/70">
                      <input
                        type="checkbox"
                        checked={item.isImportant}
                        onChange={(e) =>
                          handleUpdateFeedbackItem(item.id, {
                            isImportant: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500"
                      />
                      <Star
                        className={cn(
                          'h-4 w-4',
                          item.isImportant
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground',
                        )}
                      />
                      <span>중요 피드백 (멘티 요약 카드 전송)</span>
                    </label>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddFeedbackItem}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:bg-secondary/50 hover:text-foreground/70"
              >
                <Plus className="h-4 w-4" />
                피드백 항목 추가
              </button>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border/50 bg-secondary/30 px-5 py-4">
              <Button type="button" variant="outline" onClick={handleTempSave} disabled={saving}>
                임시 저장
              </Button>
              <Link to="/mentor/feedback">
                <Button type="button" variant="outline">
                  취소
                </Button>
              </Link>
              <Button
                type="submit"
                icon={FileText}
                disabled={saving || !feedbackItems.some((i) => i.text.trim())}
              >
                {saving ? '저장 중...' : '피드백 저장'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={templateModalOpen} onClose={() => setTemplateModalOpen(false)} maxWidth="max-w-md">
        <DialogHeader onClose={() => setTemplateModalOpen(false)}>
          <h2 className="text-lg font-semibold text-foreground">피드백 템플릿 불러오기</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            잘한 점, 보완할 점 등 템플릿을 선택하세요
          </p>
        </DialogHeader>
        <DialogBody className="max-h-96 overflow-y-auto">
          {templates.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              등록된 템플릿이 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => t.id != null && handleLoadTemplate(t.id)}
                  className="w-full rounded-lg border border-border/50 bg-white p-3 text-left text-sm hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{t.name}</p>
                    {t.subject && (
                      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[11px] text-foreground/50">
                        {getSubjectLabel(t.subject)}
                      </span>
                    )}
                  </div>
                  {t.preview && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {t.preview}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setTemplateModalOpen(false)}>
            닫기
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

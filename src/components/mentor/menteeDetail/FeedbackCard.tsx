import { Button } from '@/components/ui/Button';
import type { FeedbackItem } from '@/types';

const statusConfig: Record<string, { label: string; bg: string }> = {
  not_submit: { label: '미제출', bg: 'bg-slate-100 text-slate-700' },
  submitted: { label: '피드백 대기', bg: 'bg-amber-50 text-amber-700' },
  feedbacked: { label: '피드백 완료', bg: 'bg-emerald-50 text-emerald-700' },
  urgent: { label: '긴급', bg: 'bg-rose-50 text-rose-700' },
  pending: { label: '대기중', bg: 'bg-amber-50 text-amber-700' },
  partial: { label: '부분완료', bg: 'bg-sky-50 text-sky-700' },
  completed: { label: '완료', bg: 'bg-emerald-50 text-emerald-700' },
};

function isFeedbackCompleted(status: FeedbackItem['status']): boolean {
  return status === 'completed' || status === 'feedbacked';
}

function canWriteFeedback(status: FeedbackItem['status']): boolean {
  if (status === 'not_submit') return false;
  return !isFeedbackCompleted(status);
}

export function FeedbackCard({
  item,
  onViewAssignment,
  onFeedbackClick,
}: {
  item: FeedbackItem;
  onViewAssignment: () => void;
  onFeedbackClick: () => void;
}) {
  const status = statusConfig[item.status] ?? statusConfig.submitted;
  const completed = isFeedbackCompleted(item.status);
  const writable = canWriteFeedback(item.status);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-secondary/20 ${item.status === 'urgent' ? 'border-rose-200 bg-rose-50/30' : 'border-border/40 hover:border-border'}`}
      onClick={onViewAssignment}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewAssignment();
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-semibold text-foreground">{item.title}</span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.bg}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {completed && item.feedbackDate
              ? `피드백 작성일: ${item.feedbackDate}`
              : `제출일시: ${item.submittedAt}`}{' '}
            · {item.subject}
          </p>
          {completed && item.feedbackText && (
            <p className="mt-1 line-clamp-2 text-[11px] text-foreground/60">{item.feedbackText}</p>
          )}
        </div>
      </div>
      <div className="mt-2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
        {writable ? (
          <>
            <Button size="sm" onClick={onFeedbackClick}>
              피드백 작성하기
            </Button>
            <Button size="sm" variant="outline" onClick={onViewAssignment}>
              과제 보기
            </Button>
          </>
        ) : completed ? (
          <>
            <Button size="sm" variant="outline" onClick={onViewAssignment}>
              과제 보기
            </Button>
            <Button size="sm" variant="outline" onClick={onFeedbackClick}>
              전체 피드백 보기
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={onViewAssignment}>
            과제 보기
          </Button>
        )}
      </div>
    </div>
  );
}

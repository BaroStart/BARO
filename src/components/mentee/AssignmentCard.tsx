import { ClockIcon, DoneIcon } from '@/components/icons';
import { DEFAULT_THEME, SUBJECT_THEME } from '@/lib/subjectTheme';
import { getSubjectIcon } from '@/lib/subjectUtils';
import { cn } from '@/lib/utils';

interface AssignmentItem {
  id: number | string;
  subject: string;
  title: string;
  description?: string;
  status: string;
  deadline?: string;
}

interface AssignmentCardProps {
  assignment: AssignmentItem;
  onClick: () => void;
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AssignmentCard({ assignment: a, onClick }: AssignmentCardProps) {
  const theme = SUBJECT_THEME[a.subject] ?? DEFAULT_THEME;
  const isDone = a.status === '완료';

  if (isDone) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 text-left transition-shadow active:opacity-95"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <DoneIcon className="h-6 w-6 text-slate-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-400">{a.subject} · 완료</p>
          <h3 className="mt-0.5 truncate text-sm font-medium text-slate-400 line-through">
            {a.title}
          </h3>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-slate-100 bg-white p-4 text-left transition-shadow active:opacity-95"
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            theme.iconBg,
          )}
        >
          {getSubjectIcon(a.subject, cn('h-5 w-5', theme.iconText))}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('text-xs font-medium', theme.label)}>{a.subject}</p>
          <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-slate-800">
            {a.title}
          </h3>
          {a.description && (
            <p className="mt-1 line-clamp-1 text-xs text-slate-500">{a.description}</p>
          )}
        </div>
      </div>
      {a.deadline && (
        <div className="mt-3 flex justify-end">
          <div className="flex items-center gap-1.5">
            <ClockIcon className="h-3 w-3 shrink-0 text-slate-300" />
            <span className="text-[11px] font-medium text-slate-400">{a.deadline} 마감</span>
          </div>
        </div>
      )}
    </button>
  );
}

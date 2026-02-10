import { ClockIcon, UserIcon } from '@/components/icons';
import { DEFAULT_THEME, SUBJECT_THEME } from '@/lib/subjectTheme';
import { getSubjectIcon } from '@/lib/subjectUtils';
import { cn } from '@/lib/utils';

export type Subject = 'KOREAN' | 'ENGLISH' | 'MATH' | 'ETC';

export type FeedbackItem = {
  id: string;
  subject: Subject;
  mentorName: string;
  content: string;
  timeText?: string;
  assignmentCount?: number;
  assignmentId?: string;
  status?: 'NEW' | 'READ';
  assignmentTitles?: string[];
};

type Props = {
  item: FeedbackItem;
  onClick?: () => void;
};

const SUBJECT_LABELS: Record<Subject, string> = {
  KOREAN: '국어',
  ENGLISH: '영어',
  MATH: '수학',
  ETC: '기타',
};

export function FeedbackCard({ item, onClick }: Props) {
  const label = SUBJECT_LABELS[item.subject] ?? item.subject;
  const theme = SUBJECT_THEME[label] ?? DEFAULT_THEME;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-slate-100 bg-white p-4 text-left transition-shadow active:opacity-95"
    >
      <div className="flex items-start gap-3.5">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            theme.iconBg,
          )}
        >
          {getSubjectIcon(label, cn('h-5 w-5', theme.iconText))}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <p className={cn('text-xs font-medium', theme.label)}>{label}</p>

          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
              <UserIcon className="h-3 w-3 text-slate-400" />
            </div>
            <span className="text-[13px] font-medium text-slate-700">
              {item.mentorName} 멘토
            </span>
          </div>

          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {item.content}
          </p>

          {item.assignmentTitles && item.assignmentTitles.length > 0 && (
            <p className="line-clamp-1 text-[11px] text-slate-400">
              {item.assignmentTitles.slice(0, 2).join(' · ')}
              {item.assignmentTitles.length > 2 && ` 외 ${item.assignmentTitles.length - 2}개`}
            </p>
          )}
        </div>
      </div>

      {item.timeText && (
        <div className="mt-3 flex justify-end">
          <div className="flex items-center gap-1.5">
            <ClockIcon className="h-3 w-3 shrink-0 text-slate-300" />
            <span className="text-[11px] font-medium text-slate-400">{item.timeText}</span>
          </div>
        </div>
      )}
    </button>
  );
}

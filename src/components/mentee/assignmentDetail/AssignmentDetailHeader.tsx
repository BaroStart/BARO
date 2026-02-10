import { cn } from '@/lib/utils';

const SUBJECT_LABEL_STYLE: Record<string, string> = {
  국어: 'text-rose-600 bg-rose-50',
  영어: 'text-amber-600 bg-amber-50',
  수학: 'text-sky-600 bg-sky-50',
};

export default function AssignmentDetailHeader({ assignment }: { assignment: Assignment }) {
  const labelStyle = SUBJECT_LABEL_STYLE[assignment.subject] ?? 'text-slate-600 bg-slate-100';

  return (
    <div className="border-b border-slate-100 bg-white px-6 pb-6 pt-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-medium', labelStyle)}>
          {assignment.subject}
        </span>
        <span className="text-sm text-slate-400">{assignment.submissionDate}</span>
      </div>
      <h1 className="mb-2 text-lg font-semibold leading-tight text-slate-900">
        {assignment.title}
      </h1>
      {assignment.description && (
        <p className="text-sm leading-relaxed text-slate-500">{assignment.description}</p>
      )}
    </div>
  );
}

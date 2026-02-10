import { UserIcon } from '@/components/icons';

type Props = {
  title?: string;
  message: string;
  coachName?: string;
  updatedText?: string;
  className?: string;
};

export function PlannerSummaryCard({
  title = '플래너 총평',
  message,
  coachName,
  updatedText,
  className,
}: Props) {
  return (
    <section
      className={[
        'rounded-xl border border-slate-100 bg-white p-4',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>

      <p className="mt-2 text-sm leading-[1.6] text-slate-500">{message}</p>

      <div className="mt-3 flex items-center justify-between">
        {coachName && (
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
              <UserIcon className="h-3 w-3 text-slate-400" />
            </div>
            <span className="text-xs font-medium text-slate-400">{coachName}</span>
          </div>
        )}
        {updatedText && (
          <span className="text-[11px] font-medium text-slate-400">{updatedText}</span>
        )}
      </div>
    </section>
  );
}

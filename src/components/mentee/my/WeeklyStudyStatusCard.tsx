type Props = {
  title?: string;
  percent: number; 
  totalStudyText: string;
  completedText: string;
  className?: string;
};

function clampPercent(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function WeeklyStudyStatusCard({
  title = '이번주 학습 현황',
  percent,
  totalStudyText,
  completedText,
  className,
}: Props) {
  const p = clampPercent(percent);

  return (
    <section className={['rounded-2xl border border-gray-100 bg-white p-4 shadow-sm', className ?? ''].join(' ')}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <span className="text-sm font-semibold text-gray-700">{p}%</span>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[hsl(var(--brand))]" style={{ width: `${p}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 px-3 py-3">
          <p className="text-xs text-gray-400">총 학습시간</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{totalStudyText}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-3">
          <p className="text-xs text-gray-400">총 과제</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{completedText}</p>
        </div>
      </div>
    </section>
  );
}

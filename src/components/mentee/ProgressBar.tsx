interface ProgressBarProps {
  doneCount: number;
  total: number;
}

export function ProgressBar({ doneCount, total }: ProgressBarProps) {
  if (total === 0) return null;

  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className="mb-5 px-0 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">오늘의 학습</span>
        <span className="text-xs text-slate-400">
          {doneCount}/{total} 완료
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-700 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

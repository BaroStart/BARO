import { BarChart3 } from 'lucide-react';

import { getGradeLabel } from '@/lib/gradeLabels';
import { cn } from '@/lib/utils';

export function MenteeSelector({
  mentees,
  selectedMenteeId,
  onSelect,
}: {
  mentees: { id: string; name: string; grade: string; track: string }[];
  selectedMenteeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <label className="mb-2 block text-sm font-medium text-slate-700">분석할 멘티 선택</label>
      <select
        value={selectedMenteeId}
        onChange={(e) => onSelect(e.target.value)}
        className={cn(
          'flex h-9 w-full max-w-xs items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background',
          'focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <option value="">멘티를 선택하세요</option>
        {mentees.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({getGradeLabel(m.grade) || m.grade} · {m.track})
          </option>
        ))}
      </select>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12">
      <BarChart3 className="h-12 w-12 text-slate-300" />
      <h3 className="mt-4 text-lg font-semibold text-slate-800">학습 리포트</h3>
      <p className="mt-2 max-w-md text-center text-sm text-slate-500">{message}</p>
    </div>
  );
}

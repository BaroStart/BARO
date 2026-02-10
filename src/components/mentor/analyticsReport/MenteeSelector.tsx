import { BarChart3 } from 'lucide-react';

import { DefaultSelect } from '@/components/ui/select';

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
      <DefaultSelect
        value={selectedMenteeId}
        onValueChange={onSelect}
        placeholder="멘티를 선택하세요"
        className="sm:max-w-xs"
        options={mentees.map((m) => ({
          value: m.id,
          label: `${m.name} (${m.grade} · ${m.track})`,
        }))}
      />
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

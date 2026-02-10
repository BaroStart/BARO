import { useMemo } from "react";
import { AssignmentCard, type AssignmentItem } from "./AssignmentCard";

type Props = {
  items: AssignmentItem[];
  onOpen: (assignmentId: string) => void;
};

export function AssignmentList({ items, onOpen }: Props) {
  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "PENDING" ? -1 : 1;
    });
    return copy;
  }, [items]);

  const pendingCount = sorted.filter((x) => x.status === "PENDING").length;

  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-slate-700">과제</h3>
        <span className="text-[11px] text-slate-400">
          미완료 {pendingCount} / 전체 {sorted.length}
        </span>
      </div>

      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-[13px] text-slate-400">
            해당 날짜에 과제가 없습니다.
          </div>
        ) : (
          sorted.map((it) => (
            <AssignmentCard
              key={it.id}
              item={it}
              onOpen={() => onOpen(it.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

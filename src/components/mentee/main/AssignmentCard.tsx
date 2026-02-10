import { ClockIcon, DoneIcon } from "@/components/icons";

export type AssignmentStatus = "PENDING" | "DONE";

export type AssignmentItem = {
  id: string;
  title: string;
  status: AssignmentStatus;
  dueAtText?: string;
  startedAtText?: string;
  endedAtText?: string;
};

type Props = {
  item: AssignmentItem;
  onOpen: () => void;
};

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

export function AssignmentCard({ item, onOpen }: Props) {
  const isDone = item.status === "DONE";

  if (isDone) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-3 text-left transition active:opacity-95"
      >
        <DoneIcon className="h-4 w-4 shrink-0 text-slate-300" />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-slate-400 line-through">
          {item.title}
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-200" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-3 text-left transition active:opacity-95"
    >
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[13px] font-semibold text-slate-800">
          {item.title}
        </h3>
        {item.dueAtText && (
          <div className="mt-0.5 flex items-center gap-1">
            <ClockIcon className="h-3 w-3 text-slate-300" />
            <span className="text-[11px] text-slate-400">마감 {item.dueAtText}</span>
          </div>
        )}
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
    </button>
  );
}

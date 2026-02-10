import { UserIcon } from "@/components/icons";

export type FeedbackSummaryItem = {
  id: string;
  mentorName: string;
  timeAgoText: string;
  message: string;
  subject?: string;
  mentorAvatar?: string;
};

type Props = {
  items?: FeedbackSummaryItem[];
  onClickItem?: (item: FeedbackSummaryItem) => void;
  className?: string;
  title?: string;
  emptyText?: string;
};

export function FeedbackSummarySection({
  items = [],
  onClickItem,
  className,
  title = "피드백 요약",
  emptyText = "아직 피드백이 없습니다.",
}: Props) {
  return (
    <section className={["w-full", className ?? ""].join(" ").trim()}>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-sm font-extrabold text-slate-900">{title}</h2>
        <span className="text-[11px] font-semibold text-slate-400">{items.length}개</span>
      </div>

      {items.length === 0 ? (
        <p className="py-4 text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((it) => (
            <li key={it.id}>
              <FeedbackSummaryCard item={it} onClick={onClickItem} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type CardProps = {
  item: FeedbackSummaryItem;
  onClick?: (item: FeedbackSummaryItem) => void;
  className?: string;
};

/** 멘토명(강조) → 날짜(보조) → 본문(콘텐츠 블록) 위계 */
function FeedbackSummaryCard({ item, onClick, className }: CardProps) {
  const clickable = Boolean(onClick);

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => onClick?.(item)}
      className={[
        "flex w-full items-start gap-3 py-4 text-left transition-colors hover:bg-slate-50/80",
        clickable ? "" : "cursor-default",
        className ?? "",
      ].join(" ")}
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-white">
        {item.mentorAvatar ? (
          <img src={item.mentorAvatar} alt={item.mentorName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <UserIcon className="h-5 w-5" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-900">{item.mentorName} 멘토</span>
          <span className="shrink-0 text-[11px] font-medium text-slate-400">{item.timeAgoText}</span>
        </div>
        <div className="mt-2 rounded-lg border border-slate-200 border-l-2 border-l-slate-400 bg-white px-2.5 py-2">
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-700">
            {item.message}
          </p>
        </div>
      </div>
    </button>
  );
}

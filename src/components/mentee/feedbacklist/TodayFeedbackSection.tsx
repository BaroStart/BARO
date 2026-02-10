import { UserIcon } from "@/components/icons";

export type TodayFeedback = {
  id: string;
  mentorName: string;
  timeAgoText: string;
  message: string;
};

type Props = {
  item?: TodayFeedback | null;
  onClick?: (item: TodayFeedback) => void;
  className?: string;
};

export function TodayFeedbackCard({ item, onClick, className }: Props) {
  const clickable = Boolean(item && onClick);

  return (
    <section className={["w-full", className ?? ""].join(" ").trim()}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-900">오늘의 피드백</h2>
      </div>

      {!item ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-500">
          오늘은 아직 받은 피드백이 없어요.
        </div>
      ) : (
        <button
          type="button"
          disabled={!clickable}
          onClick={() => item && onClick?.(item)}
          className={[
            "relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition",
            "hover:bg-slate-50 hover:shadow-md active:scale-[0.99]",
            clickable ? "" : "cursor-default",
          ].join(" ")}
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-[hsl(var(--brand))]" />

          <div className="flex items-start gap-3 pl-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
              <UserIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-black">{item.mentorName}</span>
                <span className="text-slate-300">·</span>
                <span>{item.timeAgoText}</span>
              </div>

              <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-slate-800">{item.message}</p>
            </div>
          </div>
        </button>
      )}
    </section>
  );
}

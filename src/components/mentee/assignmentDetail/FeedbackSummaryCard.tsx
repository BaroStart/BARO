import { UserIcon } from "@/components/icons";

type Props = {
  mentorName: string;
  summary: string;
  feedbackTime?: string;
  mentorAvatar?: string;
  className?: string;
};

export function FeedbackSummaryCard({
  mentorName,
  summary,
  feedbackTime,
  mentorAvatar,
  className,
}: Props) {
  return (
    <div
      className={[
        "rounded-2xl border border-[hsl(var(--brand-light))] bg-white p-5 text-slate-950 shadow-sm",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-100 bg-slate-100">
            {mentorAvatar ? (
              <img src={mentorAvatar} alt={mentorName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[hsl(var(--brand))]">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{mentorName}</span>
            {feedbackTime && (
              <span className="text-xs font-medium text-slate-400">{feedbackTime}</span>
            )}
          </div>
          <p className="break-keep text-sm font-medium leading-relaxed text-slate-600">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}

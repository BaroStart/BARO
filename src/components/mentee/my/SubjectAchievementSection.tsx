import { EnglishIcon, KoreanIcon, MathIcon } from "@/components/icons";

export type SubjectAchievementItem = {
  id: string;
  name: "국어" | "영어" | "수학" | string;
  percent: number;
  progressText?: string;
};

type Props = {
  title?: string;
  items: SubjectAchievementItem[];
  className?: string;
};

const SUBJECT_COLOR: Record<string, { stroke: string; iconText: string; iconBg: string; nameText: string }> = {
  국어: { stroke: "stroke-rose-400", iconText: "text-rose-500", iconBg: "bg-rose-50 border-rose-100", nameText: "text-rose-600" },
  영어: { stroke: "stroke-amber-400", iconText: "text-amber-500", iconBg: "bg-amber-50 border-amber-100", nameText: "text-amber-600" },
  수학: { stroke: "stroke-sky-400", iconText: "text-sky-500", iconBg: "bg-sky-50 border-sky-100", nameText: "text-sky-600" },
};
const DEFAULT_COLOR = { stroke: "stroke-slate-300", iconText: "text-slate-500", iconBg: "bg-slate-50 border-slate-100", nameText: "text-slate-600" };

function iconFor(name: SubjectAchievementItem["name"], colorClass: string) {
  const iconClass = `h-4 w-4 ${colorClass}`;
  switch (name) {
    case "국어":
      return <KoreanIcon className={iconClass} />;
    case "영어":
      return <EnglishIcon className={iconClass} />;
    case "수학":
      return <MathIcon className={iconClass} />;
    default:
      return <div className="h-5 w-5" />;
  }
}

function clampPercent(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function SubjectAchievementSection({
  title = "과목별 달성률",
  items,
  className,
}: Props) {
  return (
    <section className={["", className ?? ""].join(" ").trim()}>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {items.map((s) => {
          const p = clampPercent(s.percent);
          const color = SUBJECT_COLOR[s.name] ?? DEFAULT_COLOR;

          return (
            <div
              key={s.id}
              className="flex flex-col items-center rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
            >
              <div className="relative flex h-10 w-10 items-center justify-center">
                <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    className="stroke-slate-100"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    className={color.stroke}
                    strokeWidth="3"
                    strokeDasharray={`${p * 1.0} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className={`absolute flex h-6 w-6 items-center justify-center rounded-full border ${color.iconBg}`}>
                  {iconFor(s.name, color.iconText)}
                </div>
              </div>
              <p className={`mt-1.5 text-[11px] font-semibold ${color.nameText}`}>{s.name}</p>
              <p className="text-xs text-slate-500">{p}%</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * 과목/필터 칩 버튼 - 피드백·과제 페이지 공통
 * 디자인 시스템: h-9, rounded-full, px-4
 */
type ChipItem = { label: string; value: string };

type Props = {
  items: ChipItem[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

export function SubjectFilterChip({ items, value, onChange, className }: Props) {
  if (items.length === 0) return null;

  return (
    <div className={["flex flex-wrap gap-2", className ?? ""].join(" ").trim()}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          aria-pressed={value === item.value}
          className={[
            "h-9 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
            value === item.value
              ? "bg-slate-800 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-200",
          ].join(" ")}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

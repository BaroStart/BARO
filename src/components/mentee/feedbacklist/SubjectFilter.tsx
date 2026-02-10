type Subject = "ALL" | "KOREAN" | "ENGLISH" | "MATH";

type Props = {
  value: Subject;
  onChange: (v: Subject) => void;
};

export function SubjectFilter({ value, onChange }: Props) {
  const items: { label: string; value: Subject }[] = [
    { label: "전체", value: "ALL" },
    { label: "국어", value: "KOREAN" },
    { label: "영어", value: "ENGLISH" },
    { label: "수학", value: "MATH" },
  ];

  return (
    <div className="mt-2 mb-2 flex gap-2 overflow-x-auto scrollbar-hide">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          type="button"
          aria-pressed={value === item.value}
          className={[
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
            "border",
            value === item.value
              ? "bg-[hsl(var(--brand))] text-white border-[hsl(var(--brand))] shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
          ].join(" ")}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

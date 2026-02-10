import { useMemo, useState } from "react";

type YYYYMMDD = string;

export type DayMeta = {
  assignmentCount?: number;
  todoCount?: number;
};

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  metaByDate?: Record<YYYYMMDD, DayMeta>;
  defaultExpanded?: boolean;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toKeyLocal(d: Date): YYYYMMDD {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${pad2(m)}-${pad2(day)}`;
}

function addMonths(d: Date, diff: number) {
  return new Date(d.getFullYear(), d.getMonth() + diff, 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekStartSunday(d: Date) {
  const day = d.getDay();
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function buildWeekRow(selected: Date) {
  const start = getWeekStartSunday(selected);
  const days: Date[] = [];
  const cur = new Date(start);
  for (let i = 0; i < 7; i++) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

type Cell = { date: Date; inMonth: boolean };

function buildMonthCells(monthRef: Date): Cell[] {
  const y = monthRef.getFullYear();
  const m = monthRef.getMonth();

  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);

  const daysInMonth = last.getDate();
  const leading = first.getDay();
  const prevLast = new Date(y, m, 0).getDate();

  const cells: Cell[] = [];

  for (let i = 0; i < leading; i++) {
    const day = prevLast - (leading - 1 - i);
    cells.push({ date: new Date(y, m - 1, day), inMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(y, m, d), inMonth: true });
  }

  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= trailing; i++) {
    cells.push({ date: new Date(y, m + 1, i), inMonth: false });
  }

  return cells;
}

function DotIndicator({ a, t }: { a: number; t: number }) {
  const hasA = a > 0;
  const hasT = t > 0;

  return (
    <div className="mt-1 flex h-1.5 items-center justify-center gap-0.5">
      {hasA && (
        <span className="h-1 w-1 shrink-0 rounded-full bg-slate-700" />
      )}
      {hasT && (
        <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
      )}
    </div>
  );
}


const TODAY = new Date();
const TODAY_KEY = toKeyLocal(TODAY);

function DayCell({
  date,
  inMonth,
  selected,
  isToday,
  a,
  t,
  onPick,
}: {
  date: Date;
  inMonth: boolean;
  selected: boolean;
  isToday: boolean;
  a: number;
  t: number;
  onPick: () => void;
}) {
  const base =
    "relative flex min-h-[44px] flex-col items-center justify-start rounded-lg p-0.5 transition";

  if (!inMonth) {
    return (
      <button
        type="button"
        onClick={onPick}
        className={`${base} bg-transparent`}
      >
        <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full">
          <span className="text-xs font-medium text-slate-200">{date.getDate()}</span>
        </div>
        <div className="mt-1 h-1.5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onPick}
      className={[base, "focus:outline-none"].join(" ")}
    >
      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full transition">
        <div
          className={[
            "flex h-full w-full items-center justify-center rounded-full transition",
            selected
              ? "bg-slate-800 text-white"
              : isToday
                ? "ring-1 ring-slate-300 bg-transparent hover:bg-slate-50"
                : "bg-transparent hover:bg-slate-50",
          ].join(" ")}
        >
          <span
            className={[
              "text-xs font-medium transition",
              selected
                ? "text-white font-semibold"
                : isToday
                  ? "text-slate-800 font-semibold"
                  : "text-slate-600",
            ].join(" ")}
          >
            {date.getDate()}
          </span>
        </div>
      </div>
      <DotIndicator a={a} t={t} />
    </button>
  );
}

export function Calendar({
  value,
  onChange,
  metaByDate = {},
  defaultExpanded = false,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const [monthRef, setMonthRef] = useState<Date>(
    new Date(value.getFullYear(), value.getMonth(), 1)
  );

  const monthCells = useMemo(() => buildMonthCells(monthRef), [monthRef]);
  const week = useMemo(() => buildWeekRow(value), [value]);

  const monthLabel = `${monthRef.getFullYear()}년 ${monthRef.getMonth() + 1}월`;

  const cells = expanded
    ? monthCells
    : week.map((d) => ({
        date: d,
        inMonth:
          d.getFullYear() === monthRef.getFullYear() &&
          d.getMonth() === monthRef.getMonth(),
      }));

  return (
    <section className="rounded-xl border border-slate-100 bg-white p-3">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setMonthRef(addMonths(monthRef, -1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
          aria-label="이전 달"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="text-sm font-semibold text-slate-700">{monthLabel}</span>

        <button
          type="button"
          onClick={() => setMonthRef(addMonths(monthRef, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
          aria-label="다음 달"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-slate-400">
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-0.5">
        {cells.map(({ date, inMonth }) => {
          const key = toKeyLocal(date);

          const meta = metaByDate[key] ?? {};
          const a = meta.assignmentCount ?? 0;
          const t = meta.todoCount ?? 0;

          const selected = isSameDay(date, value);

          return (
            <DayCell
              key={key}
              date={date}
              inMonth={inMonth}
              selected={selected}
              isToday={key === TODAY_KEY}
              a={a}
              t={t}
              onPick={() => {
                onChange(date);
                if (
                  date.getFullYear() !== monthRef.getFullYear() ||
                  date.getMonth() !== monthRef.getMonth()
                ) {
                  setMonthRef(new Date(date.getFullYear(), date.getMonth(), 1));
                }
              }}
            />
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600"
        >
          {expanded ? "주간 보기" : "월간 보기"}
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
            {expanded ? (
              <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </div>
    </section>
  );
}

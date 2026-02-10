import { useMemo, useState } from 'react';

type YYYYMMDD = string;

type StudyDayMeta = {
  hours?: number; 
};

type Props = {
  className?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function toKeyLocal(d: Date): YYYYMMDD {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function addMonths(d: Date, diff: number) {
  return new Date(d.getFullYear(), d.getMonth() + diff, 1);
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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

function intensityFromHours(hours?: number): 0 | 1 | 2 | 3 {
  const h = hours ?? 0;
  if (h >= 10) return 3;
  if (h >= 5) return 2;
  if (h > 0 && h < 2) return 1;
  if (h > 0) return 1;
  return 0;
}

function cellClassByIntensity(i: 0 | 1 | 2 | 3) {
  if (i === 3) return 'bg-[hsl(var(--brand))] text-white';
  if (i === 2) return 'bg-[hsl(var(--brand))]/70 text-white';
  if (i === 1) return 'bg-[hsl(var(--brand-light))] text-[hsl(var(--brand))]';
  return 'bg-slate-100 text-slate-600';
}

function DayCell({
  date,
  inMonth,
  selected,
  intensity,
  isFuture,
  onPick,
}: {
  date: Date;
  inMonth: boolean;
  selected: boolean;
  intensity: 0 | 1 | 2 | 3;
  isFuture?: boolean;
  onPick: () => void;
}) {
  const base =
    'relative flex min-h-[60px] flex-col items-center justify-start rounded-xl p-2 transition';

  if (!inMonth) {
  return (
    <button type="button" onClick={onPick} className={`${base} bg-white hover:bg-slate-50`}>
        <div className="mt-2 flex h-10 w-10 items-center justify-center rounded-2xl">
          <span className="text-sm font-medium text-slate-300">{date.getDate()}</span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onPick}
      className={[base, 'bg-white focus:outline-none'].join(' ')}
    >
      <div className="group mt-2 flex h-10 w-10 items-center justify-center rounded-2xl">
      <div
        className={[
          'flex h-full w-full items-center justify-center rounded-full transition',
          selected ? 'bg-[hsl(var(--brand))]' : isFuture ? 'bg-slate-50 text-slate-400' : cellClassByIntensity(intensity),
          !selected ? 'group-hover:opacity-90' : '',
        ].join(' ')}
      >
          <span
            className={[
              'text-sm font-semibold transition',
              selected ? 'text-white' : intensity >= 2 ? 'text-white' : 'text-slate-900',
            ].join(' ')}
          >
            {date.getDate()}
          </span>
        </div>
      </div>
    </button>
  );
}

function useDummyStudyMeta(monthRef: Date) {
  return useMemo<Record<YYYYMMDD, StudyDayMeta>>(() => {
    const y = monthRef.getFullYear();
    const m = monthRef.getMonth(); 

    const entries: Array<[YYYYMMDD, StudyDayMeta]> = [];
    for (let day = 1; day <= 28; day++) {
      const d = new Date(y, m, day);
      const key = toKeyLocal(d);

      const mod = (day * 7) % 13;
      const hours = mod >= 10 ? 10 + (mod % 3) : mod >= 5 ? 5 + (mod % 4) : mod >= 1 ? mod % 2 : 0;

      entries.push([key, { hours }]);
    }

    return Object.fromEntries(entries);
  }, [monthRef]);
}

export function MonthlyStudyCalendar({ className }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [expanded, setExpanded] = useState<boolean>(true);

  const [monthRef, setMonthRef] = useState<Date>(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const metaByDate = useDummyStudyMeta(monthRef);

  const monthCells = useMemo(() => buildMonthCells(monthRef), [monthRef]);
  const week = useMemo(() => buildWeekRow(selectedDate), [selectedDate]);

  const monthLabel = `${monthRef.getFullYear()}년 ${monthRef.getMonth() + 1}월`;

  const cells = expanded
    ? monthCells
    : week.map((d) => ({
        date: d,
        inMonth: d.getFullYear() === monthRef.getFullYear() && d.getMonth() === monthRef.getMonth(),
      }));

  return (
    <section className={['rounded-2xl border border-slate-100 bg-white p-5 shadow-sm', className ?? ''].join(' ')}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthRef(addMonths(monthRef, -1))}
          className="rounded-2xl px-3 py-2 text-2xl font-semibold text-slate-500 hover:bg-slate-50"
          aria-label="이전 달"
        >
          ‹
        </button>
        
        <div className="text-center text-base font-bold text-slate-900">
          {monthLabel}
        </div>

        <button
          type="button"
          onClick={() => setMonthRef(addMonths(monthRef, 1))}
          className="rounded-2xl px-3 py-2 text-2xl font-semibold text-slate-500 hover:bg-slate-50"
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--brand))]" /> 10시간 이상
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--brand))]/70" /> 5시간 이상
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--brand-light))]" /> 2시간 미만
        </span>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[12px] font-semibold text-slate-500">
        {['일', '월', '화', '수', '목', '금', '토'].map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {cells.map(({ date, inMonth }) => {
          const key = toKeyLocal(date);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          const isFuture = date > today;
          const hours = isFuture ? undefined : (metaByDate[key]?.hours ?? 0);
          const intensity = intensityFromHours(hours);
          const selected = isSameDay(date, selectedDate);

          return (
            <DayCell
              key={key}
              date={date}
              inMonth={inMonth}
              selected={selected}
              intensity={intensity}
              isFuture={isFuture}
              onPick={() => {
                setSelectedDate(date);
                if (date.getFullYear() !== monthRef.getFullYear() || date.getMonth() !== monthRef.getMonth()) {
                  setMonthRef(new Date(date.getFullYear(), date.getMonth(), 1));
                }
              }}
            />
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand-light))]"
        >
          {expanded ? '주간 캘린더 보기' : '월간 캘린더 보기'}
          <span className="text-xs">{expanded ? '▴' : '▾'}</span>
        </button>
      </div>
    </section>
  );
}

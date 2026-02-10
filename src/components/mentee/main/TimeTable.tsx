import React, { useMemo } from "react";
import { getTimetableColors, getTimetablePaletteId } from "@/lib/timetableColorStorage";

export type TimelineItemType = "task" | "assignment";

export type TimelineItem = {
  id: string;
  type: TimelineItemType;
  title: string;
  start: string;
  end: string;
  showTitle?: boolean;
};

type TimeTableProps = {
  items: TimelineItem[];
  startHour?: number;
  endHour?: number;
  className?: string;
  rowHeightPx?: number;
  dateKey?: string;
  selectedDate?: Date;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseHHMM(hhmm: string) {
  const [h, m] = hhmm.split(":").map((v) => Number(v));
  return h * 60 + m;
}

function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * 타임테이블 블록 색상 규칙
 * - `title` + `id` 문자열을 해시하여 팔레트 중 하나를 결정
 * - 사용자가 설정에서 색상 팔레트 선택 가능 (기본/파스텔/비비드/차분)
 */
function gradientFromKey(key: string, colors: string[]) {
  const idx = Math.abs(hashString(key)) % colors.length;
  return colors[idx];
}

function splitIntoHourSegments(params: {
  startMin: number;
  endMin: number;
  startHour: number;
  endHour: number; 
}) {
  const { startMin, endMin, startHour, endHour } = params;

  const gridStart = startHour * 60;
  const gridEnd =
    endHour > startHour ? endHour * 60 : (24 + endHour) * 60; 

  let s0 = startMin;
  let e0 = endMin;
  if (e0 <= s0) e0 += 24 * 60;

  const s = clamp(s0, gridStart, gridEnd);
  const e = clamp(e0, gridStart, gridEnd);
  if (e <= s) return [];

  const segments: Array<{
    hour: number;
    colStart: number;
    colEnd: number;
    isFirst: boolean;
    isLast: boolean;
  }> = [];

  const startHAbs = Math.floor(s / 60);
  const endHAbs = Math.floor((e - 1) / 60);

  for (let hAbs = startHAbs; hAbs <= endHAbs; hAbs++) {
    const hourStart = hAbs * 60;
    const hourEnd = hourStart + 60;

    const segStart = Math.max(s, hourStart);
    const segEnd = Math.min(e, hourEnd);

    const startInHour = segStart - hourStart;
    const endInHour = segEnd - hourStart; 

    const colStart = clamp(startInHour + 1, 1, 60);
    const colEnd = clamp(endInHour + 1, 2, 61);

    segments.push({
      hour: hAbs,
      colStart,
      colEnd,
      isFirst: hAbs === startHAbs,
      isLast: hAbs === endHAbs,
    });
  }

  return segments;
}

export function TimeTable({
  items,
  startHour = 6,
  endHour = 24,
  className,
  rowHeightPx = 32,
  dateKey: _dateKey,
  selectedDate: _selectedDate,
}: TimeTableProps) {
  const paletteColors = useMemo(() => getTimetableColors(), []);
  const isLightPalette = ["softMint", "mono"].includes(getTimetablePaletteId());

  const hourRows = useMemo(() => {
    const rows: number[] = [];

    const totalHours =
        endHour > startHour ? endHour - startHour : 24 - startHour + endHour;

    for (let i = 0; i < totalHours; i++) {
        rows.push(startHour + i);
    }
    return rows;
    }, [startHour, endHour]);

  const blocks = useMemo(() => {
    const out: Array<{
      key: string;
      hour: number;
      colStart: number;
      colEnd: number;
      title?: string;
      bg: string;
      isFirst: boolean;
      isLast: boolean;
    }> = [];

    for (const it of items) {
      const startMin = parseHHMM(it.start);
      const endMin = parseHHMM(it.end);

      const segs = splitIntoHourSegments({
        startMin,
        endMin,
        startHour,
        endHour,
      });

      const bg = gradientFromKey(`${it.title}-${it.id}`, paletteColors);

      segs.forEach((seg, idx) => {
        out.push({
          key: `${it.id}-${seg.hour}-${idx}`,
          hour: seg.hour,
          colStart: seg.colStart,
          colEnd: seg.colEnd,
          title: it.showTitle !== false && seg.isFirst ? it.title : undefined,
          bg,
          isFirst: seg.isFirst,
          isLast: seg.isLast,
        });
      });
    }

    return out;
  }, [items, startHour, endHour, paletteColors]);

  const gridBgStyle: React.CSSProperties = {
    backgroundImage: `
      repeating-linear-gradient(
        to right,
        rgba(226,232,240,0.6) 0px,
        rgba(226,232,240,0.6) 1px,
        transparent 1px,
        transparent calc((100% / 6))
      )
    `,
  };

  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <>
        <div
          className={[
            "w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm",
            className ?? "",
          ].join(" ")}
        >
          <div className="flex flex-col items-center justify-center gap-3 px-4 pb-6 pt-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100/80">
            <svg
              className="h-6 w-6 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-600">오늘의 학습 기록이 없어요</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              할 일을 완료하면 타임라인에 표시돼요
            </p>
          </div>
        </div>
      </div>
    </>
    );
  }

  return (
    <div
      className={[
        "w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex gap-2 px-3 pb-3 pt-3">
        <div className="flex flex-col">
          {hourRows.map((h) => (
            <div
              key={h}
              style={{ height: rowHeightPx }}
              className="pr-1 text-right text-[10px] font-medium text-slate-400 tabular-nums"
            >
              {h % 24}
            </div>
          ))}
        </div>

        <div className="relative flex-1 min-w-0">
          <div className="relative rounded-md overflow-hidden">
            {hourRows.map((h) => (
              <div
                key={h}
                style={{ height: rowHeightPx, ...gridBgStyle }}
                className="border-t border-slate-100"
              />
            ))}
            <div className="absolute inset-y-0 left-0 w-px bg-slate-100" />
            <div className="absolute inset-y-0 right-0 w-px bg-slate-100" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100" />
          </div>

          <div
            className="pointer-events-none absolute inset-0 grid"
            style={{
              gridTemplateColumns: "repeat(60, minmax(0, 1fr))",
              gridTemplateRows: `repeat(${hourRows.length}, ${rowHeightPx}px)`,
            }}
          >
            {blocks.map((b) => {
              const rowIndex = b.hour - startHour + 1;

              const rounding =
                b.isFirst && b.isLast
                  ? "rounded-md"
                  : b.isFirst
                    ? "rounded-t-md"
                    : b.isLast
                      ? "rounded-b-md"
                      : "rounded-none";

              return (
                <div
                  key={b.key}
                  className={[
                    "mx-[1px] my-0.5 flex items-center overflow-hidden rounded-sm",
                    "border border-white/20",
                    rounding,
                  ].join(" ")}
                  style={{
                    gridRowStart: rowIndex,
                    gridRowEnd: rowIndex + 1,
                    gridColumnStart: b.colStart,
                    gridColumnEnd: b.colEnd,
                    background: b.bg,
                  }}
                >
                  {b.title ? (
                    <span
                      className={[
                        "truncate px-1 text-[9px] font-semibold drop-shadow-sm",
                        isLightPalette ? "text-slate-700" : "text-white",
                      ].join(" ")}
                    >
                      {b.title}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

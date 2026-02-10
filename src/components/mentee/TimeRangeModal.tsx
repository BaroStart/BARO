import { useEffect, useState } from "react";

import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/Sheet";

export type TimeRangeValue = {
  start: { meridiem: "AM" | "PM"; hour: number; minute: number };
  end: { meridiem: "AM" | "PM"; hour: number; minute: number };
};

type Props = {
  open: boolean;
  title?: string;
  submitLabel?: string;
  initialValue?: TimeRangeValue;
  onClose: () => void;
  onSubmit: (value: TimeRangeValue) => void;
};

function to24(m: "AM" | "PM", h12: number, min: number) {
  const h = h12 % 12;
  return `${String(m === "PM" ? h + 12 : h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function from24(time: string): { meridiem: "AM" | "PM"; hour: number; minute: number } {
  const [hStr, mStr] = time.split(":");
  let h = Number(hStr);
  const minute = Number(mStr);
  const meridiem: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return { meridiem, hour: h, minute };
}

export function TimeRangeModal({
  open,
  title = "공부 기록 추가",
  submitLabel = "저장",
  initialValue,
  onClose,
  onSubmit,
}: Props) {
  const [startTime, setStartTime] = useState("05:00");
  const [endTime, setEndTime] = useState("07:55");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initialValue) {
      setStartTime(to24(initialValue.start.meridiem, initialValue.start.hour, initialValue.start.minute));
      setEndTime(to24(initialValue.end.meridiem, initialValue.end.hour, initialValue.end.minute));
    } else {
      setStartTime("05:00");
      setEndTime("07:55");
    }
    setError("");
  }, [open, initialValue]);

  const handleSubmit = () => {
    if (endTime <= startTime) {
      setError("종료 시간이 시작 시간보다 늦어야 해요.");
      return;
    }
    onSubmit({ start: from24(startTime), end: from24(endTime) });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <SheetBody className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="w-10 text-[13px] font-semibold text-slate-600">시작</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-10 text-[13px] font-semibold text-slate-600">종료</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </SheetBody>

        <SheetFooter>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-[13px] font-medium text-slate-500 transition hover:bg-slate-50 active:scale-[0.99]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-slate-800 py-2.5 text-[13px] font-medium text-white transition hover:bg-slate-700 active:scale-[0.99]"
          >
            {submitLabel}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

import { useState } from 'react';
import { Palette } from 'lucide-react';
import { TimeTableColorModal } from '@/components/mentee/main/TimeTableColorModal';
import { getPaletteDisplayInfo } from '@/lib/timetableColorStorage';

type Props = {
  className?: string;
};

export function ThemeCard({ className }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const { brand, brandLight } = getPaletteDisplayInfo();

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={[
          'flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-slate-200 hover:shadow-md',
          className ?? '',
        ].join(' ')}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <Palette className="h-5 w-5 text-slate-500" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-bold text-slate-900">컬러 팔레트</p>
          <p className="text-xs text-slate-500">탭해서 변경 · 뱃지/달성률/캘린더 색상 적용</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <div
            className="h-5 w-5 rounded-full border border-slate-200"
            style={{ background: `hsl(${brand})` }}
            title="메인"
          />
          <div
            className="h-5 w-5 rounded-full border border-slate-200"
            style={{ background: `hsl(${brandLight})` }}
            title="라이트"
          />
        </div>
      </button>
      <TimeTableColorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={() => window.dispatchEvent(new Event('theme-changed'))}
        mode="theme"
      />
    </>
  );
}

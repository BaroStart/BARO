import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Palette } from 'lucide-react';
import {
  type TimetablePaletteId,
  TIMETABLE_PALETTES,
  PALETTE_ORDER,
  PALETTE_TO_BRAND,
  firstColorFromGradient,
  getTimetablePaletteId,
  setTimetablePaletteId,
} from '@/lib/timetableColorStorage';
import {
  getCustomBrandColor,
  setCustomBrandColor,
  applyCustomBrandColor,
  deriveFromBrand,
  hexToHsl,
} from '@/lib/customColorStorage';
import { STORAGE_KEYS } from '@/constants';

function hslToHex(hsl: string): string {
  const m = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!m) return '#22c55e';
  const h = Number(m[1]) / 360;
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect?: () => void;
  /** 설정 화면에서는 "컬러 테마" 제목, 타임테이블에서는 "타임테이블 색상" */
  mode?: 'timetable' | 'theme';
};

export function TimeTableColorModal({ open, onClose, onSelect, mode = 'timetable' }: Props) {
  const current = getTimetablePaletteId();
  const custom = getCustomBrandColor();
  const [customPickerOpen, setCustomPickerOpen] = useState(false);
  const [hex, setHex] = useState(() => (custom ? hslToHex(`hsl(${custom.brand})`) : '#22c55e'));

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && custom) setHex(hslToHex(`hsl(${custom.brand})`));
  }, [open, custom]);

  if (!open) return null;

  const handleSelect = (id: Exclude<TimetablePaletteId, 'custom'>) => {
    setTimetablePaletteId(id);
    setCustomPickerOpen(false);
    onSelect?.();
    onClose();
  };

  const handleCustomApply = () => {
    const brandHsl = hexToHsl(hex.length === 7 ? hex : `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`);
    const value = deriveFromBrand(brandHsl);
    setCustomBrandColor(value);
    applyCustomBrandColor(value);
    localStorage.setItem(STORAGE_KEYS.TIMETABLE_COLOR_PALETTE, 'custom');
    setCustomPickerOpen(false);
    onSelect?.();
    onClose();
  };

  const isTheme = mode === 'theme';
  const title = isTheme ? '컬러 테마' : '타임테이블 색상';
  const description = isTheme ? '달성률 · 캘린더 · 뱃지 색상 적용' : '블록에 적용할 팔레트를 선택하세요';

  const modal = (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[min(420px,calc(100vw-2rem))] max-h-[min(85vh,calc(100vh-2rem))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {PALETTE_ORDER.map((id) => {
              const { name, colors } = TIMETABLE_PALETTES[id];
              const brandHsl = PALETTE_TO_BRAND[id].brand;
              const brandColor = `hsl(${brandHsl})`;
              const paletteColors = colors.map((c) => firstColorFromGradient(c));
              const isSelected = current === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelect(id)}
                  className={[
                    'relative flex h-[76px] w-full flex-col justify-between rounded-lg border-2 p-2.5 text-left box-border transition duration-200',
                    'outline-none hover:bg-slate-50/50',
                    isSelected
                      ? 'border-slate-800 bg-slate-50/30 shadow-[0_0_0_2px_rgba(30,41,59,0.15)]'
                      : 'border-slate-200',
                  ].join(' ')}
                >
                  {isSelected && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-white">
                      <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                    </span>
                  )}
                  <div className="flex gap-1 flex-wrap">
                    <div
                      className="h-3.5 w-3.5 shrink-0 rounded-sm border border-white/80 shadow-sm"
                      style={{ background: brandColor }}
                      title="적용됨"
                    />
                    {paletteColors.slice(0, 5).map((c, i) => (
                      <div
                        key={i}
                        className="h-3 w-3 shrink-0 rounded overflow-hidden border border-white/60"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 leading-tight">{name}</span>
                </button>
              );
            })}
            {/* 직접 만들기 카드 */}
            <button
              type="button"
              onClick={() => setCustomPickerOpen((v) => !v)}
              className={[
                'relative flex h-[76px] w-full flex-col justify-between rounded-lg border-2 p-2.5 text-left box-border transition duration-200',
                'outline-none hover:bg-slate-50/50',
                current === 'custom'
                  ? 'border-slate-800 bg-slate-50/30 shadow-[0_0_0_2px_rgba(30,41,59,0.15)]'
                  : 'border-slate-200',
              ].join(' ')}
            >
              {current === 'custom' && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-white">
                  <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                </span>
              )}
              <div className="flex h-7 w-full items-center justify-center rounded border border-slate-200 bg-white">
                <Palette className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">직접 만들기</span>
            </button>
          </div>

          {customPickerOpen && (
            <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
              <p className="mb-2 text-xs font-semibold text-slate-600">색상 선택</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="h-12 w-12 shrink-0 cursor-pointer rounded-lg border-2 border-slate-200 bg-transparent p-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">{hex}</p>
                  <button
                    type="button"
                    onClick={handleCustomApply}
                    className="mt-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
                    style={{ background: hex }}
                  >
                    적용
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition duration-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

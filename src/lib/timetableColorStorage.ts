import { STORAGE_KEYS } from '@/constants';

/** GLOBAL_PALETTES - 컬러 팔레트 구성 (Teal 기반 기본) */
export const GLOBAL_PALETTES = {
  default: { brand: '193 55% 45%', brandMedium: '193 45% 82%', brandLight: '193 40% 96%' },
  pastel: { brand: '199 45% 72%', brandMedium: '199 40% 88%', brandLight: '199 35% 96%' },
  story: { brand: '210 50% 75%', brandMedium: '210 40% 88%', brandLight: '210 35% 96%' },
  softMint: { brand: '160 40% 68%', brandMedium: '160 35% 85%', brandLight: '160 30% 95%' },
  mono: { brand: '215 15% 35%', brandMedium: '215 10% 80%', brandLight: '215 10% 96%' },
  vivid: { brand: '199 65% 55%', brandMedium: '199 55% 82%', brandLight: '199 45% 95%' },
  calm: { brand: '215 25% 40%', brandMedium: '215 20% 85%', brandLight: '215 15% 96%' },
} as const;

/** 로고 기본 컬러 (legacy) */
const LOGO_BRAND = '215 25% 35%';
const LOGO_BRAND_LIGHT = '215 20% 95%';
const LOGO_BRAND_MEDIUM = '215 20% 88%';

export type TimetablePaletteId = 'logo' | 'instagram' | 'softMint' | 'mono' | 'default' | 'story' | 'pastel' | 'vivid' | 'calm' | 'custom';

/** 오늘의 학습 타임테이블용 컬러 팔레트 — 선명하고 생동감 있는 그라디언트 */
export const TIMETABLE_PALETTES: Record<Exclude<TimetablePaletteId, 'custom'>, { name: string; colors: string[] }> = {
  /** 기본 — 틸/시안 계열, 칙칙함 없이 선명하게 */
  default: {
    name: '기본',
    colors: [
      'linear-gradient(135deg, #0D9488 0%, #2DD4BF 100%)',
      'linear-gradient(135deg, #0891B2 0%, #22D3EE 100%)',
      'linear-gradient(135deg, #0E7490 0%, #06B6D4 100%)',
      'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
      'linear-gradient(135deg, #155E75 0%, #0EA5E9 100%)',
      'linear-gradient(135deg, #0C4A6E 0%, #38BDF8 100%)',
    ],
  },
  /** 로고 — 파랑 계열, 채도 높게 */
  logo: {
    name: '로고',
    colors: [
      'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
      'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
      'linear-gradient(135deg, #3B82F6 0%, #93C5FD 100%)',
      'linear-gradient(135deg, #1E40AF 0%, #6366F1 100%)',
      'linear-gradient(135deg, #4338CA 0%, #818CF8 100%)',
      'linear-gradient(135deg, #3730A3 0%, #6366F1 100%)',
    ],
  },
  /** 인스타 — 흑백+회색 (선택용) */
  instagram: {
    name: '인스타',
    colors: [
      'linear-gradient(135deg, #374151 0%, #6B7280 100%)',
      'linear-gradient(135deg, #4B5563 0%, #9CA3AF 100%)',
      'linear-gradient(135deg, #1F2937 0%, #4B5563 100%)',
      'linear-gradient(135deg, #6B7280 0%, #D1D5DB 100%)',
      'linear-gradient(135deg, #111827 0%, #6B7280 100%)',
      'linear-gradient(135deg, #9CA3AF 0%, #E5E7EB 100%)',
    ],
  },
  /** 소프트 민트 — 파스텔이지만 선명한 톤 */
  softMint: {
    name: '소프트 민트',
    colors: [
      'linear-gradient(135deg, #99F6E4 0%, #5EEAD4 100%)',
      'linear-gradient(135deg, #A5F3FC 0%, #67E8F9 100%)',
      'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)',
      'linear-gradient(135deg, #F9A8D4 0%, #F472B6 100%)',
      'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)',
      'linear-gradient(135deg, #B4F1D4 0%, #6EE7B7 100%)',
    ],
  },
  /** 모노톤 — 부드럽지만 색감 있는 그레이/라벤더 */
  mono: {
    name: '모노톤',
    colors: [
      'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
      'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
      'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%)',
      'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
      'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)',
    ],
  },
  /** 파스텔 — 생기 있는 파스텔 */
  pastel: {
    name: '파스텔',
    colors: [
      'linear-gradient(135deg, #7DD3FC 0%, #38BDF8 100%)',
      'linear-gradient(135deg, #F9A8D4 0%, #EC4899 100%)',
      'linear-gradient(135deg, #6EE7B7 0%, #34D399 100%)',
      'linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%)',
      'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
      'linear-gradient(135deg, #67E8F9 0%, #22D3EE 100%)',
    ],
  },
  /** 스토리 — 그라데이션 감성, 선명 */
  story: {
    name: '스토리',
    colors: [
      'linear-gradient(135deg, #818CF8 0%, #C7D2FE 100%)',
      'linear-gradient(135deg, #F472B6 0%, #FBCFE8 100%)',
      'linear-gradient(135deg, #34D399 0%, #A7F3D0 100%)',
      'linear-gradient(135deg, #FBBF24 0%, #FDE68A 100%)',
      'linear-gradient(135deg, #A78BFA 0%, #E9D5FF 100%)',
      'linear-gradient(135deg, #38BDF8 0%, #BAE6FD 100%)',
    ],
  },
  /** 비비드 — 가장 선명한 포인트 컬러 */
  vivid: {
    name: '비비드',
    colors: [
      'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
      'linear-gradient(135deg, #DC2626 0%, #F87171 100%)',
      'linear-gradient(135deg, #059669 0%, #34D399 100%)',
      'linear-gradient(135deg, #D97706 0%, #FBBF24 100%)',
      'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
      'linear-gradient(135deg, #DB2777 0%, #F472B6 100%)',
    ],
  },
  /** 차분 — 칙칙하지 않은 무드 컬러 (세이지·더스티 블루·로즈) */
  calm: {
    name: '차분',
    colors: [
      'linear-gradient(135deg, #5B8A72 0%, #86EFAC 100%)',
      'linear-gradient(135deg, #64748B 0%, #94A3B8 100%)',
      'linear-gradient(135deg, #B45309 0%, #FDBA74 100%)',
      'linear-gradient(135deg, #6B7280 0%, #A78BFA 100%)',
      'linear-gradient(135deg, #BE185D 0%, #F9A8D4 100%)',
      'linear-gradient(135deg, #0E7490 0%, #67E8F9 100%)',
    ],
  },
};

/** 팔레트 표시 순서 (기본이 맨 위) */
export const PALETTE_ORDER: Exclude<TimetablePaletteId, 'custom'>[] = [
  'default',
  'logo',
  'instagram',
  'softMint',
  'mono',
  'pastel',
  'story',
  'vivid',
  'calm',
];

export function getTimetablePaletteId(): TimetablePaletteId {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMETABLE_COLOR_PALETTE);
    if (!raw) return 'default';
    const id = raw as TimetablePaletteId;
    if (id === 'custom') return getCustomBrandForTimetable() ? 'custom' : 'default';
    return id in TIMETABLE_PALETTES ? id : 'default';
  } catch {
    return 'default';
  }
}

function getCustomBrandForTimetable(): { brand: string; brandLight: string; brandMedium: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_BRAND_COLOR);
    if (!raw) return null;
    return JSON.parse(raw) as { brand: string; brandLight: string; brandMedium: string };
  } catch {
    return null;
  }
}

export function setTimetablePaletteId(id: TimetablePaletteId): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE_COLOR_PALETTE, id);
    if (id === 'custom') return;
    // 프리셋 선택 시 커스텀 컬러 제거
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_BRAND_COLOR);
    applyPaletteAsBrand(id);
  } catch {
    // ignore
  }
}

/** 그라디언트 문자열에서 첫 색상 추출 (solid color용, swatch 표시 등) */
export function firstColorFromGradient(grad: string): string {
  const hslMatch = grad.match(/hsl\(([^)]+)\)/);
  if (hslMatch) return `hsl(${hslMatch[1]})`;
  const hexMatch = grad.match(/#[A-Fa-f0-9]{6}/);
  if (hexMatch) return hexMatch[0];
  return 'hsl(var(--brand))';
}

/** 팔레트 6색을 solid color로 반환 (할 일 색상바 등용) */
export function getTimetablePaletteAccentColors(): string[] {
  const colors = getTimetableColors();
  return colors.map(firstColorFromGradient);
}

export function getTimetableColors(): string[] {
  const id = getTimetablePaletteId();
  if (id === 'custom') {
    const custom = getCustomBrandForTimetable();
    if (!custom) return TIMETABLE_PALETTES.default.colors;
    const b = custom.brand;
    return [
      `linear-gradient(135deg, hsl(${b}) 0%, hsl(${b}) 100%)`,
      `linear-gradient(135deg, hsl(${b}) 0%, hsl(${b}) 100%)`,
      `linear-gradient(135deg, hsl(${b}) 0%, hsl(${b}) 100%)`,
      `linear-gradient(135deg, hsl(${b}) 0%, hsl(${b}) 100%)`,
      `linear-gradient(135deg, hsl(${b}) 0%, hsl(${b}) 100%)`,
      `linear-gradient(135deg, hsl(${b}) 0%, hsl(${b}) 100%)`,
    ];
  }
  return TIMETABLE_PALETTES[id].colors;
}

/** 팔레트별 --brand에 적용할 HSL (메인 1색 + 라이트/미디엄) */
export const PALETTE_TO_BRAND: Record<Exclude<TimetablePaletteId, 'custom'>, { brand: string; brandLight: string; brandMedium: string }> = {
  logo: { brand: LOGO_BRAND, brandLight: LOGO_BRAND_LIGHT, brandMedium: LOGO_BRAND_MEDIUM },
  instagram: { brand: '215 25% 35%', brandLight: '215 20% 95%', brandMedium: '215 20% 88%' },
  softMint: { ...GLOBAL_PALETTES.softMint },
  mono: { ...GLOBAL_PALETTES.mono },
  default: { ...GLOBAL_PALETTES.default },
  pastel: { ...GLOBAL_PALETTES.pastel },
  story: { ...GLOBAL_PALETTES.story },
  vivid: { ...GLOBAL_PALETTES.vivid },
  calm: { ...GLOBAL_PALETTES.calm },
};

export function applyPaletteAsBrand(id: TimetablePaletteId): void {
  if (id === 'custom') return;
  const v = PALETTE_TO_BRAND[id];
  const root = document.documentElement;
  root.style.setProperty('--brand', v.brand);
  root.style.setProperty('--brand-light', v.brandLight);
  root.style.setProperty('--brand-medium', v.brandMedium);
  // primary도 테마에 맞춰 적용 (파란 고정 제거)
  root.style.setProperty('--primary', v.brand);
  root.style.setProperty('--ring', v.brand);
}

export function getPaletteDisplayInfo(): { name: string; brand: string; brandLight: string; brandMedium: string } {
  const id = getTimetablePaletteId();
  if (id === 'custom') {
    const c = getCustomBrandForTimetable();
    return c ? { name: '직접 만들기', ...c } : { name: '기본', ...PALETTE_TO_BRAND.default };
  }
  const v = PALETTE_TO_BRAND[id];
  const name = TIMETABLE_PALETTES[id as Exclude<TimetablePaletteId, 'custom'>]?.name ?? '로고';
  return { name, ...v };
}

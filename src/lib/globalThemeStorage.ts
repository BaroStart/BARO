import { STORAGE_KEYS } from '@/constants';
import {
  applyCustomBrandColor as applyCustom,
  getCustomBrandColor,
  setCustomBrandColor,
  deriveFromBrand,
  hexToHsl,
} from './customColorStorage';

export type GlobalThemeId = 'default' | 'pastel' | 'calm' | 'vivid' | 'softMint' | 'custom';

export type GlobalThemeValue = {
  brand: string;
  brandLight: string;
  brandMedium: string;
};

/** GLOBAL_PALETTES와 동일한 컬러 구성 */
export const GLOBAL_THEMES: Record<Exclude<GlobalThemeId, 'custom'>, { name: string; value: GlobalThemeValue }> = {
  default: {
    name: '기본',
    value: { brand: '193 55% 45%', brandLight: '193 40% 96%', brandMedium: '193 45% 82%' },
  },
  pastel: {
    name: '파스텔',
    value: { brand: '199 45% 72%', brandLight: '199 35% 96%', brandMedium: '199 40% 88%' },
  },
  calm: {
    name: '차분',
    value: { brand: '215 25% 40%', brandLight: '215 15% 96%', brandMedium: '215 20% 85%' },
  },
  vivid: {
    name: '비비드',
    value: { brand: '199 65% 55%', brandLight: '199 45% 95%', brandMedium: '199 55% 82%' },
  },
  softMint: {
    name: '소프트 민트',
    value: { brand: '160 40% 68%', brandLight: '160 30% 95%', brandMedium: '160 35% 85%' },
  },
};

export function getGlobalThemeId(): GlobalThemeId {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GLOBAL_THEME);
    if (!raw) return 'default';
    const id = raw as GlobalThemeId;
    if (id === 'custom') return getCustomBrandColor() ? 'custom' : 'default';
    return id in GLOBAL_THEMES ? id : 'default';
  } catch {
    return 'default';
  }
}

/** 사용자가 직접 테마를 선택한 적이 있는지 (초기 기본값 vs 사용자 선택 구분) */
export function hasUserSelectedTheme(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.GLOBAL_THEME) !== null;
  } catch {
    return false;
  }
}

export function setGlobalThemeId(id: GlobalThemeId): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GLOBAL_THEME, id);
    applyGlobalTheme(id);
  } catch {
    // ignore
  }
}

export function setCustomColorFromHex(hex: string): void {
  const full = hex.length === 7 ? hex : `${hex}#`.slice(0, 7);
  const brandHsl = hexToHsl(full);
  const value = deriveFromBrand(brandHsl);
  setCustomBrandColor(value);
  applyCustom(value);
  localStorage.setItem(STORAGE_KEYS.GLOBAL_THEME, 'custom');
}

export function getThemeDisplayInfo(id: GlobalThemeId): { name: string; value: GlobalThemeValue } {
  if (id === 'custom') {
    const custom = getCustomBrandColor();
    return custom
      ? { name: '커스텀', value: custom }
      : { name: '기본', value: GLOBAL_THEMES.default.value };
  }
  return GLOBAL_THEMES[id] as { name: string; value: GlobalThemeValue };
}

export function applyGlobalTheme(id: GlobalThemeId): void {
  if (id === 'custom') {
    const custom = getCustomBrandColor();
    if (custom) applyCustom(custom);
    return;
  }
  const theme = GLOBAL_THEMES[id].value;
  const root = document.documentElement;
  root.style.setProperty('--brand', theme.brand);
  root.style.setProperty('--brand-light', theme.brandLight);
  root.style.setProperty('--brand-medium', theme.brandMedium);
}

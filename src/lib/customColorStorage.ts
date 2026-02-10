import { STORAGE_KEYS } from '@/constants';

/** HSL 문자열 (예: "142 71% 45%") */
export type CustomBrandValue = {
  brand: string;
  brandLight: string;
  brandMedium: string;
};

function parseHsl(hsl: string): { h: number; s: number; l: number } {
  const m = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!m) return { h: 142, s: 71, l: 45 };
  return { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) };
}

function toHsl(h: number, s: number, l: number) {
  return `${h} ${s}% ${l}%`;
}

export function getCustomBrandColor(): CustomBrandValue | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_BRAND_COLOR);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomBrandValue;
    return parsed;
  } catch {
    return null;
  }
}

export function setCustomBrandColor(value: CustomBrandValue): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_BRAND_COLOR, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function applyCustomBrandColor(value: CustomBrandValue): void {
  const root = document.documentElement;
  root.style.setProperty('--brand', value.brand);
  root.style.setProperty('--brand-light', value.brandLight);
  root.style.setProperty('--brand-medium', value.brandMedium);
  root.style.setProperty('--primary', value.brand);
  root.style.setProperty('--ring', value.brand);
}

/** hex (#rrggbb) → HSL 문자열 */
export function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lVal = Math.round(l * 100);
  return `${h} ${s}% ${lVal}%`;
}

/** 메인 컬러로부터 파생값 생성 */
export function deriveFromBrand(brandHsl: string): CustomBrandValue {
  const { h, s, l } = parseHsl(brandHsl);
  return {
    brand: toHsl(h, s, l),
    brandLight: toHsl(h, Math.max(0, s - 20), 95),
    brandMedium: toHsl(h, Math.max(0, s - 30), 85),
  };
}

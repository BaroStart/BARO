import { STORAGE_KEYS } from '@/constants';

export function getRepresentativeBadgeId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.REPRESENTATIVE_BADGE_ID);
  } catch {
    return null;
  }
}

export function setRepresentativeBadgeId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REPRESENTATIVE_BADGE_ID, id);
  } catch {
    // ignore
  }
}

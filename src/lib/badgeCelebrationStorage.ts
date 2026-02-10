import { STORAGE_KEYS } from '@/constants';

export function getLastSeenBadgeIds(userKey: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENTEE_LAST_SEEN_BADGE_IDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed[userKey] ?? [];
  } catch {
    return [];
  }
}

export function setLastSeenBadgeIds(userKey: string, ids: string[]): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENTEE_LAST_SEEN_BADGE_IDS);
    const parsed = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    parsed[userKey] = ids;
    localStorage.setItem(STORAGE_KEYS.MENTEE_LAST_SEEN_BADGE_IDS, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

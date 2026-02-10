import { STORAGE_KEYS } from '@/constants';

export interface PersonalSchedule {
  id: string;
  menteeId: string;
  title: string;
  eventType: string;
  date: string;
}

function getKey(menteeId: string) {
  return `${STORAGE_KEYS.PERSONAL_SCHEDULES}-${menteeId}`;
}

export function getPersonalSchedules(menteeId: string): PersonalSchedule[] {
  try {
    const raw = localStorage.getItem(getKey(menteeId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePersonalSchedules(menteeId: string, schedules: PersonalSchedule[]): void {
  localStorage.setItem(getKey(menteeId), JSON.stringify(schedules));
}

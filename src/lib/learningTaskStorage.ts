import { STORAGE_KEYS } from '@/constants';

export interface StoredLearningTask {
  id: string;
  menteeId: string;
  date: string;
  title: string;
  subject: string;
  completed: boolean;
}

/** 서버 태스크에 대한 로컬 오버라이드 (이동/삭제) */
export interface LearningTaskOverrides {
  dateOverrides: Record<string, string>; // id -> new date
  deletedIds: string[];
}

function getKey(menteeId: string) {
  return `${STORAGE_KEYS.PERSONAL_SCHEDULES}-learning-${menteeId}`;
}
function getOverridesKey(menteeId: string) {
  return `${STORAGE_KEYS.PERSONAL_SCHEDULES}-learning-overrides-${menteeId}`;
}

export function getLearningTasks(menteeId: string): StoredLearningTask[] {
  try {
    const raw = localStorage.getItem(getKey(menteeId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLearningTasks(menteeId: string, tasks: StoredLearningTask[]): void {
  localStorage.setItem(getKey(menteeId), JSON.stringify(tasks));
}

export function getLearningTaskOverrides(menteeId: string): LearningTaskOverrides {
  try {
    const raw = localStorage.getItem(getOverridesKey(menteeId));
    return raw ? JSON.parse(raw) : { dateOverrides: {}, deletedIds: [] };
  } catch {
    return { dateOverrides: {}, deletedIds: [] };
  }
}

export function saveLearningTaskOverrides(menteeId: string, overrides: LearningTaskOverrides): void {
  localStorage.setItem(getOverridesKey(menteeId), JSON.stringify(overrides));
}

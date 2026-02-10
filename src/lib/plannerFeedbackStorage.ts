import type { PlannerFeedback } from '@/data/plannerMock';
import { STORAGE_KEYS } from '@/constants/storage';

export function getPlannerFeedback(menteeId: string, date: string): PlannerFeedback | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANNER_FEEDBACK);
    const all: PlannerFeedback[] = raw ? JSON.parse(raw) : [];
    return all.find((f) => f.menteeId === menteeId && f.date === date) ?? null;
  } catch {
    return null;
  }
}

export function savePlannerFeedback(feedback: PlannerFeedback): void {
  const raw = localStorage.getItem(STORAGE_KEYS.PLANNER_FEEDBACK);
  const all: PlannerFeedback[] = raw ? JSON.parse(raw) : [];
  const idx = all.findIndex((f) => f.menteeId === feedback.menteeId && f.date === feedback.date);
  if (idx >= 0) all[idx] = feedback;
  else all.push(feedback);
  localStorage.setItem(STORAGE_KEYS.PLANNER_FEEDBACK, JSON.stringify(all));
}

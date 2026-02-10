import { STORAGE_KEYS } from '@/constants';

export type AssignmentSubmission = {
  submittedAt: string; // ISO
};

type SubmissionMap = Record<string, Record<string, AssignmentSubmission>>; // userKey -> assignmentId -> meta

function readMap(): SubmissionMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENTEE_ASSIGNMENT_SUBMISSIONS);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SubmissionMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: SubmissionMap) {
  try {
    localStorage.setItem(STORAGE_KEYS.MENTEE_ASSIGNMENT_SUBMISSIONS, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function markAssignmentSubmitted(userKey: string, assignmentId: string, submittedAtIso = new Date().toISOString()) {
  const key = userKey.trim();
  const id = assignmentId.trim();
  if (!key || !id) return;

  const map = readMap();
  const byUser = map[key] ?? {};
  if (byUser[id]) return;

  map[key] = { ...byUser, [id]: { submittedAt: submittedAtIso } };
  writeMap(map);
}

export function getSubmittedAssignments(userKey: string): Record<string, AssignmentSubmission> {
  const key = userKey.trim();
  if (!key) return {};
  const map = readMap();
  return map[key] ?? {};
}

export function isAssignmentSubmitted(userKey: string, assignmentId: string): boolean {
  const byUser = getSubmittedAssignments(userKey);
  return !!byUser[assignmentId];
}


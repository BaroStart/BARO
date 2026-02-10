import { STORAGE_KEYS } from '@/constants';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function toYmdLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

type AttendanceMap = Record<string, string[]>; // userKey -> [YYYY-MM-DD]

function readAttendanceMap(): AttendanceMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENTEE_ATTENDANCE_DATES);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AttendanceMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAttendanceMap(map: AttendanceMap) {
  try {
    localStorage.setItem(STORAGE_KEYS.MENTEE_ATTENDANCE_DATES, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function markAttendance(userKey: string, date = new Date()) {
  const key = userKey.trim();
  if (!key) return;

  const dateKey = toYmdLocal(date);
  const map = readAttendanceMap();
  const cur = map[key] ?? [];
  if (cur.includes(dateKey)) return;

  map[key] = [...cur, dateKey].sort();
  writeAttendanceMap(map);
}

export function getAttendanceDates(userKey: string): string[] {
  const key = userKey.trim();
  if (!key) return [];
  const map = readAttendanceMap();
  return (map[key] ?? []).slice().sort();
}

type QnaCountMap = Record<string, number>;

function readQnaCountMap(): QnaCountMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENTEE_QNA_COUNT);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as QnaCountMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeQnaCountMap(map: QnaCountMap) {
  try {
    localStorage.setItem(STORAGE_KEYS.MENTEE_QNA_COUNT, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function incrementQnaCount(userKey: string, by = 1) {
  const key = userKey.trim();
  if (!key) return;

  const map = readQnaCountMap();
  const next = (map[key] ?? 0) + by;
  map[key] = next;
  writeQnaCountMap(map);
}

export function getQnaCount(userKey: string): number {
  const key = userKey.trim();
  if (!key) return 0;
  const map = readQnaCountMap();
  return map[key] ?? 0;
}


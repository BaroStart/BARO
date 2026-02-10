// 숫자를 2자리 문자열로 패딩
export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// Date → "YYYY-MM-DD" (로컬 시간 기준)
export function toYmdLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// 날짜에 일수 더하기
export function addDays(d: Date, diff: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

// 기준 날짜가 포함된 월~일 주간 날짜 배열
export function getWeekDates(centerDate: Date): Date[] {
  const day = centerDate.getDay();
  const monday = addDays(centerDate, -(day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

// 오늘 날짜 문자열 (YYYY-MM-DD)
export const getTodayDateStr = () => new Date().toISOString().split('T')[0];

// "2026.02.02 오전 10:45" → "2026-02-02"
export const parseDateFromStr = (str: string): string | null => {
  const match = str.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

// 주간 범위 (오늘-7일 ~ 오늘-1일)
export const getWeekRange = (dateStr: string) => {
  const base = new Date(dateStr);
  const yesterday = new Date(base);
  yesterday.setDate(base.getDate() - 1);
  const sevenDaysAgo = new Date(base);
  sevenDaysAgo.setDate(base.getDate() - 7);
  const fmt = (x: Date) => x.toISOString().split('T')[0];
  return { start: fmt(sevenDaysAgo), end: fmt(yesterday) };
};

// 월간 범위 (1일~말일)
export const getMonthRange = (dateStr: string) => {
  const [y, m] = dateStr.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return {
    start: `${y}-${String(m).padStart(2, '0')}-01`,
    end: `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  };
};

// 날짜가 범위 내에 있는지 확인
export const isDateInRange = (dateStr: string | null, start: string, end: string) =>
  dateStr ? dateStr >= start && dateStr <= end : false;

// "2026-02-05" → "2026년 2월 5일 수요일"
export const formatDisplayDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-');
  const date = new Date(+y, +m - 1, +d);
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${y}년 ${+m}월 ${+d}일 ${weekdays[date.getDay()]}`;
};

// "2026-02-05" → "2026.02.05"
export const formatDateDot = (dateStr: string) => dateStr.replace(/-/g, '.');

// ISO datetime → "2026.02.08 22:34"
export const formatDateTime = (raw?: string | null): string => {
  if (!raw) return '';
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${d} ${h}:${min}`;
};

// "2026.02.05" → "2026-02-05"
export const formatDateDash = (dateStr: string) => dateStr.replace(/\./g, '-');

// 주간 보기: "2월 1일 ~ 2월 7일"
export const formatWeekRange = (start: string, end: string) => {
  const [, m1, d1] = start.split('-');
  const [, m2, d2] = end.split('-');
  return `${+m1}월 ${+d1}일 ~ ${+m2}월 ${+d2}일`;
};

// 월간 보기: "2026년 2월"
export const formatMonthOnly = (dateStr: string) => {
  const [y, m] = dateStr.split('-');
  return `${y}년 ${+m}월`;
};

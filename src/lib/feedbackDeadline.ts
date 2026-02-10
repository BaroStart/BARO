/**
 * 피드백 마감: 전날 제출된 과제 → 다음날 오전 11시까지 작성
 * submittedAt 기준으로 다음날 11:00(KST)을 마감으로 계산
 */

/** 제출일시에서 날짜(YYYY-MM-DD) 파싱 */
export function parseSubmittedDate(submittedAt: string): string {
  // "2026.02.05", "2026.02.05 09:30", "2026.02.05 오전 9:00" 등
  const dotMatch = submittedAt.match(/^(\d{4})\.(\d{2})\.(\d{2})/);
  if (dotMatch) return `${dotMatch[1]}-${dotMatch[2]}-${dotMatch[3]}`;
  const dashMatch = submittedAt.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dashMatch) return `${dashMatch[1]}-${dashMatch[2]}-${dashMatch[3]}`;
  return new Date().toISOString().slice(0, 10);
}

/** 피드백 마감 시각 (다음날 11:00 KST) */
export function getFeedbackDeadline(submittedAt: string): Date {
  const dateStr = parseSubmittedDate(submittedAt);
  const [y, m, d] = dateStr.split('-').map(Number);
  const nextDay = new Date(y, m - 1, d + 1);
  nextDay.setHours(11, 0, 0, 0);
  return nextDay;
}

/** 마감 초과 여부 */
export function isFeedbackOverdue(submittedAt: string): boolean {
  return new Date() > getFeedbackDeadline(submittedAt);
}

/** 마감까지 남은 시간 (ms). 이미 지났으면 0 */
export function getRemainingMs(submittedAt: string): number {
  const deadline = getFeedbackDeadline(submittedAt);
  const now = new Date();
  return Math.max(0, deadline.getTime() - now.getTime());
}

export type DeadlineStatus = 'overdue' | 'urgent' | 'ok';

/** 마감 상태: overdue(초과), urgent(1시간 이내), ok(여유) */
export function getDeadlineStatus(submittedAt: string): DeadlineStatus {
  if (isFeedbackOverdue(submittedAt)) return 'overdue';
  const ms = getRemainingMs(submittedAt);
  const oneHour = 60 * 60 * 1000;
  if (ms <= oneHour) return 'urgent';
  return 'ok';
}

/** 남은 시간을 "X시간 X분" 형식으로 */
export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return '마감 초과';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  if (minutes > 0) return `${minutes}분`;
  return '1분 미만';
}

/** 마감 시각을 "M월 D일 오전 11시" 형식으로 */
export function formatDeadline(submittedAt: string): string {
  const d = getFeedbackDeadline(submittedAt);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 오전 11시`;
}

export type ActivityStatus = {
  /** 최근 활동 기준으로 온라인 여부 */
  isOnline: boolean;
  /** 표시할 배지 텍스트 */
  statusLabel: '활동 중' | '자리 비움';
  /** 화면에 표시할 최근 활동 텍스트 */
  lastActiveText: string;
};

function parseRelativeMinutesKo(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  if (t === '방금 전' || t === '방금' || t === '지금') return 0;

  const minMatch = t.match(/(\d+)\s*분\s*전/);
  if (minMatch) return Number(minMatch[1]);

  const hourMatch = t.match(/(\d+)\s*시간\s*전/);
  if (hourMatch) return Number(hourMatch[1]) * 60;

  const dayMatch = t.match(/(\d+)\s*일\s*전/);
  if (dayMatch) return Number(dayMatch[1]) * 24 * 60;

  return null;
}

export function getActivityStatus(lastActive?: string, onlineWithinMinutes = 10): ActivityStatus {
  const raw = lastActive?.trim();
  if (!raw) {
    return { isOnline: false, statusLabel: '자리 비움', lastActiveText: '알 수 없음' };
  }

  const minutes = parseRelativeMinutesKo(raw);
  const isOnline = minutes !== null ? minutes <= onlineWithinMinutes : false;

  return {
    isOnline,
    statusLabel: isOnline ? '활동 중' : '자리 비움',
    // 온라인일 때는 "방금 전"으로 통일해서 불일치가 없게 표시
    lastActiveText: isOnline ? '방금 전' : raw,
  };
}


import type { BadgeInfoResponse } from '@/generated';

import { badgeApi } from './clients';

/** 내 뱃지 목록 조회 */
export async function fetchMyBadges(): Promise<BadgeInfoResponse[]> {
  const { data } = await badgeApi.getMyBadges();
  return data.result ?? [];
}

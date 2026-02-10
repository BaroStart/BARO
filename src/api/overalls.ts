import { isApiSuccess } from '@/api/response';

import axiosInstance from './axiosInstance';

/** 총평 단일 항목 */
export interface OverallItem {
  id?: number;
  content?: string;
  mentorName?: string;
  createdAt?: string;
}

const api = axiosInstance;

/** 총평 등록 (멘토 → 멘티) */
export async function createOverall(
  menteeId: number,
  content: string,
): Promise<boolean> {
  const { data } = await api.post<{ status?: number; code?: string; message?: string }>(
    '/api/v1/overalls',
    { menteeId, content },
  );
  return isApiSuccess(data);
}

/** 내 총평 목록 조회 (멘티) - 특정 날짜에 받은 총평 목록 */
export async function fetchOverallsAsMentee(date?: string): Promise<OverallItem[]> {
  const { data } = await api.get<{
    status?: number;
    code?: string;
    message?: string;
    result?: OverallItem[];
  }>('/api/v1/overalls/mentee', { params: date ? { date } : undefined });
  return isApiSuccess(data) && Array.isArray(data.result) ? data.result : [];
}

/** 작성한 총평 조회 (멘토) - 특정 멘티에게 작성한 총평, 옵션으로 날짜 */
export async function fetchOverallByMentor(
  menteeId: number,
  date?: string,
): Promise<OverallItem | null> {
  const { data } = await api.get<{
    status?: number;
    code?: string;
    message?: string;
    result?: OverallItem;
  }>(`/api/v1/overalls/mentor/${menteeId}`, { params: date ? { date } : undefined });
  return isApiSuccess(data) && data.result ? data.result : null;
}

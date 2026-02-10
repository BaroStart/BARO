import type { ApiResponseGetMenteeInfoResponseDto } from '@/generated';

import axiosInstance from './axiosInstance';

/** 멘티 정보 조회 — 백엔드 경로는 GET /api/v1/{menteeId} (Swagger: Mentee API) */
export async function fetchMenteeInfo(menteeId: number): Promise<ApiResponseGetMenteeInfoResponseDto> {
  const { data } = await axiosInstance.get<ApiResponseGetMenteeInfoResponseDto>(
    `/api/v1/${menteeId}`,
  );
  return data;
}

/** 멘티 캘린더 (년월) */
export async function fetchMenteeCalendar(year: number, month: number) {
  const { data } = await menteeApi.getCalendar({ year, month });
  return data;
}

/** 멘티 타임테이블 (선택 날짜) */
export async function fetchMenteeTimetable(date?: string) {
  const { data } = await menteeApi.getTimeTable(date ? { date } : {});
  return data;
}

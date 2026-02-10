import { API_CONFIG } from './config';

import axiosInstance from './axiosInstance';

/**
 * 멘티 접속 시각을 서버에 기록합니다.
 * 현재 백엔드 Swagger에 POST /api/v1/mentee/activity 가 없어 호출하지 않습니다.
 * 백엔드에 해당 API가 추가되면 MenteeLayout useEffect에서 reportMenteeLastAccess()를 다시 호출하면
 * 멘토 화면 "마지막 접속"에 실제 접속 시간이 표시됩니다.
 */
export async function reportMenteeLastAccess(): Promise<void> {
  if (API_CONFIG.useMock) return;
  try {
    await axiosInstance.post('/api/v1/mentee/activity');
  } catch {
    // 백엔드에 해당 API가 없거나 실패해도 앱 동작에는 영향 없음
  }
}

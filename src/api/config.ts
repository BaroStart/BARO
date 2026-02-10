/**
 * API 설정
 * - VITE_USE_MOCK: 'true'면 mock 데이터 사용 (기본값)
 * - VITE_API_URL: 백엔드 API 베이스 URL
 */
export const API_CONFIG = {
  useMock: import.meta.env.VITE_USE_MOCK !== 'false',
  // 팀플/개발 편의용: 전체는 mock 유지하면서 Auth만 실 API로 붙일 때 사용
  // - VITE_USE_MOCK_AUTH='true'면 Auth도 mock 사용
  // - 기본값(false): Auth는 실 API 사용
  useMockAuth: import.meta.env.VITE_USE_MOCK_AUTH === 'true',
  // 팀플/개발 편의용: 멘토 화면만 mock으로 강제하고 싶을 때 사용
  // - VITE_USE_MOCK_MENTOR='true'면, VITE_USE_MOCK=false여도 멘토 쪽 데이터는 mock 사용
  // - 기본값: useMock 값을 따름
  useMockMentor: import.meta.env.VITE_USE_MOCK_MENTOR === 'true' ? true : import.meta.env.VITE_USE_MOCK !== 'false',
  baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL ?? ''),
} as const;

import { MOCK_SUBJECT_STUDY_TIMES, MOCK_WEEKLY_PATTERNS } from '@/data/learningAnalysisMock';
import type { DailyStudyPattern, SubjectStudyTime } from '@/types';

// TODO: 백엔드 학습 분석 API 구현 후 실 API 연동
// 현재 /mentor/mentees/:id/learning/* 엔드포인트가 백엔드에 없으므로 mock 데이터 사용

/** 과목별 학습 시간 */
export async function fetchSubjectStudyTimes(menteeId: string): Promise<SubjectStudyTime[]> {
  return MOCK_SUBJECT_STUDY_TIMES[menteeId] ?? [];
}

/** 주간 학습 패턴 */
export async function fetchWeeklyPatterns(menteeId: string): Promise<DailyStudyPattern[]> {
  return MOCK_WEEKLY_PATTERNS[menteeId] ?? [];
}

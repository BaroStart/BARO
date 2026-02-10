import { MOCK_SUBJECT_STUDY_TIMES, MOCK_WEEKLY_PATTERNS } from '@/data/learningAnalysisMock';
import type { DailyStudyPattern, SubjectStudyTime } from '@/types';

// 학습 분석/학습 리포트는 항상 목업 사용 (나머지가 실 API여도 동일)
// menteeId가 s1/s2가 아니면(실 API 멘티 ID 등) s1 목업으로 폴백
const MOCK_MENTEE_FALLBACK = 's1';

/** 과목별 학습 시간 (항상 목업, 실 API 멘티는 s1 데이터로 표시) */
export async function fetchSubjectStudyTimes(menteeId: string): Promise<SubjectStudyTime[]> {
  return (
    MOCK_SUBJECT_STUDY_TIMES[menteeId] ??
    MOCK_SUBJECT_STUDY_TIMES[MOCK_MENTEE_FALLBACK] ??
    []
  );
}

/** 주간 학습 패턴 (항상 목업, 실 API 멘티는 s1 데이터로 표시) */
export async function fetchWeeklyPatterns(menteeId: string): Promise<DailyStudyPattern[]> {
  return (
    MOCK_WEEKLY_PATTERNS[menteeId] ??
    MOCK_WEEKLY_PATTERNS[MOCK_MENTEE_FALLBACK] ??
    []
  );
}

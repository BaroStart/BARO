import type { DailyStudyPattern, SubjectStudyTime } from '@/types';

export const MOCK_SUBJECT_STUDY_TIMES: Record<string, SubjectStudyTime[]> = {
  s1: [
    { subject: '수학', hours: 52 },
    { subject: '영어', hours: 48 },
    { subject: '국어', hours: 35 },
    { subject: '과학', hours: 28 },
  ],
  s2: [
    { subject: '수학', hours: 45 },
    { subject: '영어', hours: 38 },
    { subject: '과학', hours: 42 },
    { subject: '국어', hours: 30 },
  ],
  // 실 API 멘티 ID (류채린)
  '3': [
    { subject: '수학', hours: 48 },
    { subject: '영어', hours: 42 },
    { subject: '국어', hours: 38 },
    { subject: '과학', hours: 25 },
  ],
  // 실 API 멘티 ID (정민재)
  '4': [
    { subject: '영어', hours: 55 },
    { subject: '수학', hours: 50 },
    { subject: '국어', hours: 32 },
    { subject: '과학', hours: 30 },
  ],
};

export const MOCK_WEEKLY_PATTERNS: Record<string, DailyStudyPattern[]> = {
  s1: [
    { day: '월요일', hours: 3.2, filledBlocks: 5, totalBlocks: 5 },
    { day: '화요일', hours: 3.2, filledBlocks: 5, totalBlocks: 5 },
    { day: '수요일', hours: 3.5, filledBlocks: 5, totalBlocks: 5 },
    { day: '목요일', hours: 3.0, filledBlocks: 5, totalBlocks: 5 },
    { day: '금요일', hours: 1.2, filledBlocks: 2, totalBlocks: 5 },
    { day: '토요일', hours: 3.8, filledBlocks: 5, totalBlocks: 5 },
    { day: '일요일', hours: 1.5, filledBlocks: 3, totalBlocks: 5 },
  ],
  s2: [
    { day: '월요일', hours: 2.8, filledBlocks: 4, totalBlocks: 5 },
    { day: '화요일', hours: 3.5, filledBlocks: 5, totalBlocks: 5 },
    { day: '수요일', hours: 3.2, filledBlocks: 5, totalBlocks: 5 },
    { day: '목요일', hours: 2.5, filledBlocks: 4, totalBlocks: 5 },
    { day: '금요일', hours: 2.0, filledBlocks: 3, totalBlocks: 5 },
    { day: '토요일', hours: 3.5, filledBlocks: 5, totalBlocks: 5 },
    { day: '일요일', hours: 1.0, filledBlocks: 2, totalBlocks: 5 },
  ],
  // 실 API 멘티 3 (류채린)
  '3': [
    { day: '월요일', hours: 3.0, filledBlocks: 5, totalBlocks: 5 },
    { day: '화요일', hours: 3.2, filledBlocks: 5, totalBlocks: 5 },
    { day: '수요일', hours: 2.8, filledBlocks: 4, totalBlocks: 5 },
    { day: '목요일', hours: 3.5, filledBlocks: 5, totalBlocks: 5 },
    { day: '금요일', hours: 1.5, filledBlocks: 2, totalBlocks: 5 },
    { day: '토요일', hours: 3.2, filledBlocks: 5, totalBlocks: 5 },
    { day: '일요일', hours: 2.0, filledBlocks: 3, totalBlocks: 5 },
  ],
  // 실 API 멘티 4 (정민재)
  '4': [
    { day: '월요일', hours: 3.5, filledBlocks: 5, totalBlocks: 5 },
    { day: '화요일', hours: 3.0, filledBlocks: 5, totalBlocks: 5 },
    { day: '수요일', hours: 3.8, filledBlocks: 5, totalBlocks: 5 },
    { day: '목요일', hours: 2.8, filledBlocks: 4, totalBlocks: 5 },
    { day: '금요일', hours: 2.2, filledBlocks: 3, totalBlocks: 5 },
    { day: '토요일', hours: 4.0, filledBlocks: 5, totalBlocks: 5 },
    { day: '일요일', hours: 1.2, filledBlocks: 2, totalBlocks: 5 },
  ],
};

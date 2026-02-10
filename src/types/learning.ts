/** 과목별 학습 시간 */
export interface SubjectStudyTime {
  subject: string;
  hours: number;
}

/** 일별 학습 패턴 */
export interface DailyStudyPattern {
  day: string;
  hours?: number;
  filledBlocks: number;
  totalBlocks?: number;
}

/** 국영수 과목별 성적 (단일값, 하위 호환용) */
export interface SubjectScores {
  korean?: number;
  english?: number;
  math?: number;
}

/** 내신 시점별 성적 (1학기중간, 1학기기말, 2학기중간, 2학기기말) */
export interface NaesinPeriodScores {
  midterm1?: number;
  final1?: number;
  midterm2?: number;
  final2?: number;
}

/** 모의고사 시점별 성적 (3월, 6월, 9월, 11월) */
export interface MockExamPeriodScores {
  march?: number;
  june?: number;
  september?: number;
  november?: number;
}

/** 내신 / 모의고사 성적 */
export interface MenteeScores {
  /** 시점별 내신 (과목별) */
  naesin?: Partial<Record<'korean' | 'english' | 'math', NaesinPeriodScores>>;
  /** 시점별 모의고사 (과목별) */
  mockExam?: Partial<Record<'korean' | 'english' | 'math', MockExamPeriodScores>>;
}

/** 멘티 요약 (목록/카드용) */
export interface MenteeSummary {
  id: string;
  name: string;
  school: string;
  grade: string;
  gradeFull?: string;
  track: '이과' | '문과';
  progress: number;
  todaySubmitted: number;
  todayTotal: number;
  uncheckedCount: number;
  pendingFeedbackCount: number;
  learningCert?: string;
  learningCertUploaded?: string;
  weeklyAchievement?: number;
  weeklyChange?: number;
  lastActive?: string;
  mentoringStart?: string;
  desiredMajor?: string;
  scores?: MenteeScores;
  /** 멘토가 적는 학생 메모 */
  memo?: string;
}

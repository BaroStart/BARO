export type AssignmentIconType = 'document' | 'camera' | 'book';

/** 제출된 과제 (피드백 대기/완료) */
export interface SubmittedAssignment {
  id: string;
  menteeId: string;
  title: string;
  subject: string;
  submittedAt: string;
  feedbackDone: boolean;
  iconType?: AssignmentIconType;
}

/** 미완료 과제 (멘티 상세용) */
export interface IncompleteAssignment {
  id: string;
  menteeId: string;
  title: string;
  subject: string;
  description?: string;
  /** 과제 상세 내용 (HTML) */
  content?: string;
  deadline?: string;
  deadlineDate?: string;
  status: 'completed' | 'in_progress' | 'not_started' | 'deadline_soon';
  completedAt?: string;
  completedAtDate?: string;
}

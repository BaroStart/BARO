/** 피드백 대시보드 항목 */
export interface FeedbackItem {
  id: string;
  assignmentId: string;
  menteeId: string;
  title: string;
  subject: string;
  submittedAt: string;
  /**
   * 피드백 대시보드 상태.
   * - 서버 assignmentStatus 기반: NOT_SUBMIT / SUBMITTED / FEEDBACKED
   * - 목업/레거시 상태도 함께 호환: urgent / pending / partial / completed
   */
  status:
    | 'not_submit'
    | 'submitted'
    | 'feedbacked'
    | 'urgent'
    | 'pending'
    | 'partial'
    | 'completed';
  progress?: number;
  lastUpdate?: string;
  feedbackText?: string;
  feedbackDate?: string;
}

export interface FeedbackItemData {
  id: string;
  text: string;
  isImportant: boolean;
}

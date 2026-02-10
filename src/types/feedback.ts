/** 피드백 대시보드 항목 */
export interface FeedbackItem {
  id: string;
  assignmentId: string;
  menteeId: string;
  title: string;
  subject: string;
  submittedAt: string;
  status: 'urgent' | 'pending' | 'partial' | 'completed';
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

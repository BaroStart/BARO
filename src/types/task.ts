/** 멘티 학습 일정/To-Do */
export interface MenteeTask {
  id: string;
  menteeId: string;
  date: string;
  title: string;
  subject: string;
  completed: boolean;
  completedAt?: string;
  estimatedMinutes?: number;
}

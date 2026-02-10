import type { ScheduleItem } from '@/components/mentor/ScheduleCalendar';

import type { FeedbackItem } from './feedback';

export interface TodayComment {
  id: string;
  menteeId: string;
  authorName: string;
  content: string;
  createdAt: string;
  date: string;
}

export interface MenteeKpi {
  menteeId: string;
  totalStudyHours: number;
  studyHoursChange: number;
  assignmentCompletionRate: number;
  completionRateChange: number;
  averageScore: number;
  scoreChange: number;
  attendanceRate: number;
  attendanceChange: number;
}

export type ModalType =
  | 'chat'
  | 'scheduleAdd'
  | 'assignmentDetail'
  | 'learningAnalysis'
  | 'profileEdit'
  | 'feedback'
  | null;

export interface AssignmentSelection {
  id: string | null;
  source: 'feedback' | 'incomplete';
  feedbackStatus: FeedbackItem['status'] | null;
  fallback: { title: string; goal?: string; subject?: string } | null;
}

export interface ScheduleState {
  searchQuery: string;
  contextMenu: { item: ScheduleItem; position: { x: number; y: number } } | null;
  draggedItem: ScheduleItem | null;
}

export interface LearningOverrides {
  dateOverrides: Record<string, string>;
  deletedIds: string[];
}

export interface PersonalScheduleLocal {
  id: string;
  title: string;
  eventType: string;
  date: string;
}

export interface LearningTaskLocal {
  id: string;
  title: string;
  subject: string;
  date: string;
  completed: boolean;
}

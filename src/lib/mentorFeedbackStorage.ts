/**
 * 멘토 피드백 로컬 저장소 (Mock 모드용)
 * API 연동 시 제거 또는 API 호출로 대체
 */

import { STORAGE_KEYS } from '@/constants/storage';

export interface FeedbackItem {
  id: string;
  text: string;
  isImportant: boolean;
}

export interface StoredMentorFeedback {
  menteeId: string;
  assignmentId: string;
  /** 기존 단일 텍스트 (API 호환) */
  feedbackText: string;
  status: 'partial' | 'completed';
  progress?: number;
  feedbackDate: string;
  /** 피드백 항목 (과목별 섹션) */
  feedbackItems?: FeedbackItem[];
  /** 총평 */
  totalReview?: string;
  /** 임시저장 여부 */
  isDraft?: boolean;
  /** 과제 제목 (표시용) */
  assignmentTitle?: string;
  /** 과목 (표시용) */
  subject?: string;
  /** 제출일시 (표시용) */
  submittedAt?: string;
}

function getAll(): StoredMentorFeedback[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENTOR_FEEDBACK);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAll(items: StoredMentorFeedback[]): void {
  localStorage.setItem(STORAGE_KEYS.MENTOR_FEEDBACK, JSON.stringify(items));
}

export function getMentorFeedback(
  menteeId: string,
  assignmentId: string
): StoredMentorFeedback | null {
  return (
    getAll().find(
      (f) => f.menteeId === menteeId && f.assignmentId === assignmentId
    ) ?? null
  );
}

export function saveMentorFeedback(feedback: StoredMentorFeedback): void {
  const all = getAll();
  const idx = all.findIndex(
    (f) =>
      f.menteeId === feedback.menteeId &&
      f.assignmentId === feedback.assignmentId
  );
  const toSave = {
    ...feedback,
    feedbackText:
      feedback.feedbackItems?.length
        ? feedback.feedbackItems.map((i) => i.text).join('\n\n')
        : feedback.feedbackText,
  };
  if (idx >= 0) all[idx] = toSave;
  else all.push(toSave);
  setAll(all);
}

export function getCompletedAssignmentIds(): Set<string> {
  return new Set(
    getAll()
      .filter((f) => f.status === 'completed')
      .map((f) => f.assignmentId)
  );
}

/** 완료된 피드백 전체 (임시저장 제외) - 피드백 관리 페이지용 */
export function getAllCompletedFeedback(): StoredMentorFeedback[] {
  return getAll().filter((f) => f.status === 'completed' && !f.isDraft);
}

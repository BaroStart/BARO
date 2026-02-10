import type {
  DailyFeedbackRes,
  DailyFeedbackSummaryRes,
  FeedbackListItemRes,
  GetDailyFeedbacksSubjectEnum,
  MenteeFeedbackDetailRes,
} from '@/generated';

import { feedbacksApi } from './clients';

// 멘토 피드백 목록 조회
export async function fetchFeedbackListByMentor(): Promise<FeedbackListItemRes[]> {
  const { data } = await feedbacksApi.getListByMentor();
  return data.result ?? [];
}

// 피드백 생성
export async function createFeedback(
  assignmentId: number,
  content: string,
  summary?: string,
): Promise<number | null> {
  const { data } = await feedbacksApi.createFeedback({
    assignmentId,
    feedbackCreateReq: { content, summary },
  });
  return data.result ?? null;
}

// [멘티] 오늘의 피드백 요약 조회
export async function fetchDailyFeedbackSummaries(): Promise<DailyFeedbackSummaryRes[]> {
  const { data } = await feedbacksApi.getDailyFeedbackSummaries();
  return data.result ?? [];
}

// [멘티] 데일리 피드백 목록 조회 (과목 필터 선택)
export async function fetchDailyFeedbacks(
  subject?: GetDailyFeedbacksSubjectEnum,
): Promise<DailyFeedbackRes[]> {
  const { data } = await feedbacksApi.getDailyFeedbacks(subject ? { subject } : {});
  return data.result ?? [];
}

// [멘티] 피드백 상세 조회
export async function fetchMenteeFeedbackDetail(
  assignmentId: number,
): Promise<MenteeFeedbackDetailRes | null> {
  const { data } = await feedbacksApi.getMenteeFeedbackDetail({ assignmentId });
  return data.result ?? null;
}

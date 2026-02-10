import {
  MOCK_FEEDBACK_ITEMS,
  MOCK_INCOMPLETE_ASSIGNMENTS,
  MOCK_MENTEE_KPIS,
  MOCK_MENTEE_TASKS,
  MOCK_TODAY_COMMENTS,
} from '@/data/menteeDetailMock';
import { MOCK_SUBMITTED_ASSIGNMENTS } from '@/data/mockMentees';
import type {
  FeedbackItem,
  IncompleteAssignment,
  MenteeKpi,
  MenteeTask,
  SubmittedAssignment,
  TodayComment,
} from '@/types';

import { useAuthStore } from '@/stores/useAuthStore';

import { API_CONFIG } from './config';
import { fetchMenteeDashboard, fetchMentorDashboard } from './menteeDashboard';
import type { MentorDashboardMenteeInfo, RecentSubmittedAssignmentItem } from './menteeDashboard';
import { fetchMenteeInfo } from './menteeV1';

function getDateStr(params?: { date?: string; startDate?: string; endDate?: string }): string {
  const d = params?.date ?? params?.startDate ?? params?.endDate;
  if (d) return d;
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function statusToFeedbackStatus(s?: string): FeedbackItem['status'] {
  if (s === 'completed' || s === 'COMPLETED') return 'completed';
  if (s === 'pending' || s === 'PENDING') return 'pending';
  if (s === 'urgent' || s === 'URGENT') return 'urgent';
  if (s === 'partial' || s === 'PARTIAL') return 'partial';
  return 'pending';
}

/** 피드백 대기/완료 목록 */
export async function fetchFeedbackItems(
  menteeId: string,
  params?: { subject?: string; startDate?: string; endDate?: string; date?: string },
): Promise<FeedbackItem[]> {
  if (API_CONFIG.useMock || API_CONFIG.useMockMentor) {
    return MOCK_FEEDBACK_ITEMS.filter((f) => f.menteeId === menteeId);
  }
  const numId = Number(menteeId);
  if (Number.isNaN(numId)) return [];
  const dashboard = await fetchMenteeDashboard(numId, { searchType: 'DAY', date: getDateStr(params) });
  const list = dashboard?.feedbacks ?? [];
  return list.map((f, i) => ({
    id: String(f.assignmentId ?? i),
    assignmentId: String(f.assignmentId ?? ''),
    menteeId,
    title: f.assignmentTitle ?? '',
    subject: f.subject ?? '',
    submittedAt: f.submittedAt ?? '',
    status: statusToFeedbackStatus(f.assignmentStatus),
  }));
}

/** 미완료 과제 목록 */
export async function fetchIncompleteAssignments(
  menteeId: string,
  params?: { startDate?: string; endDate?: string; date?: string },
): Promise<IncompleteAssignment[]> {
  if (API_CONFIG.useMock || API_CONFIG.useMockMentor) {
    return MOCK_INCOMPLETE_ASSIGNMENTS.filter((a) => a.menteeId === menteeId);
  }
  const numId = Number(menteeId);
  if (Number.isNaN(numId)) return [];
  const dashboard = await fetchMenteeDashboard(numId, { searchType: 'DAY', date: getDateStr(params) });
  const list = dashboard?.notCompletedAssignments ?? [];
  return list.map((a, i) => {
    const dueIso = a.dueDate ?? '';
    const deadlineDateOnly = dueIso.includes('T') ? dueIso.split('T')[0] : dueIso || undefined;
    const timeStr = dueIso ? new Date(dueIso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';
    const subjectLabel = a.subject === 'NOT_SUBMIT' ? '미제출' : (a.subject ?? '');
    return {
      id: String(a.assignmentId ?? i),
      menteeId,
      title: a.title ?? '',
      subject: subjectLabel,
      description: undefined,
      deadlineDate: deadlineDateOnly,
      deadline: deadlineDateOnly && timeStr ? `${deadlineDateOnly} ${timeStr}` : dueIso || undefined,
      status: 'not_started' as const,
    };
  });
}

/** 학습 일정/To-Do 목록 */
export async function fetchMenteeTasks(
  menteeId: string,
  params?: { date?: string; startDate?: string; endDate?: string },
): Promise<MenteeTask[]> {
  if (API_CONFIG.useMock || API_CONFIG.useMockMentor) {
    return MOCK_MENTEE_TASKS.filter((t) => t.menteeId === menteeId);
  }
  const numId = Number(menteeId);
  if (Number.isNaN(numId)) return [];
  const dashboard = await fetchMenteeDashboard(numId, { searchType: 'DAY', date: getDateStr(params) });
  const list = dashboard?.todos ?? [];
  const dateStr = getDateStr(params);
  return list.map((t, i) => ({
    id: `task-${i}`,
    menteeId,
    date: dateStr,
    title: t.title ?? '',
    subject: '',
    completed: t.status === 'DONE' || t.status === 'done' || t.status === 'completed',
    completedAt: t.status === 'DONE' || t.status === 'done' ? t.finishAt : undefined,
  }));
}

/** 오늘의 한마디 & 질문 */
export async function fetchTodayComments(menteeId: string, date?: string): Promise<TodayComment | null> {
  if (API_CONFIG.useMock || API_CONFIG.useMockMentor) {
    return MOCK_TODAY_COMMENTS.find((c) => c.menteeId === menteeId) ?? null;
  }
  const numId = Number(menteeId);
  if (Number.isNaN(numId)) return null;
  const dateStr = date ?? getDateStr({});
  const dashboard = await fetchMenteeDashboard(numId, { searchType: 'DAY', date: dateStr });
  const comments = dashboard?.comments ?? [];
  const first = comments[0];
  if (!first) return null;
  return {
    id: String(first.commentId ?? ''),
    menteeId,
    authorName: first.menteeName ?? '',
    content: first.content ?? '',
    createdAt: first.createdAt ?? '',
    date: dateStr,
  };
}

/** 멘티 KPI 지표 */
export async function fetchMenteeKpi(menteeId: string): Promise<MenteeKpi | null> {
  if (API_CONFIG.useMock || API_CONFIG.useMockMentor) {
    return MOCK_MENTEE_KPIS.find((k) => k.menteeId === menteeId) ?? null;
  }
  const numId = Number(menteeId);
  if (Number.isNaN(numId)) return null;
  try {
    const data = await fetchMenteeInfo(numId);
    const r = data?.result;
    if (!r) return null;
    return {
      menteeId,
      totalStudyHours: (r.totalStudyTime ?? 0) / 60,
      studyHoursChange: 0,
      assignmentCompletionRate: r.assignmentAchieveRate ?? 0,
      completionRateChange: 0,
      averageScore: r.averageScore ?? 0,
      scoreChange: 0,
      attendanceRate: 0,
      attendanceChange: 0,
    };
  } catch {
    return null;
  }
}

function mapDashboardToSubmittedAssignments(
  menteeInfoList: MentorDashboardMenteeInfo[] | undefined,
): SubmittedAssignment[] {
  if (!menteeInfoList?.length) return [];
  const out: SubmittedAssignment[] = [];
  menteeInfoList.forEach((mentee, idx) => {
    const menteeIdStr = mentee.menteeId != null ? String(mentee.menteeId) : String(idx);
    const items = mentee.recentSubmittedAssignment ?? [];
    items.forEach((item: RecentSubmittedAssignmentItem) => {
      out.push({
        id: String(item.assignmentId ?? out.length),
        menteeId: menteeIdStr,
        title: item.title ?? '',
        subject: '',
        submittedAt: item.submittedAt ?? item.dueDate ?? new Date().toISOString(),
        feedbackDone: false,
        iconType: 'document',
      });
    });
  });
  return out;
}

/** 제출 과제 목록. mock 시 목업, 아니면 멘토 대시보드 recentSubmittedAssignment 기반 */
export async function fetchSubmittedAssignments(menteeId?: string): Promise<SubmittedAssignment[]> {
  if (API_CONFIG.useMock || API_CONFIG.useMockMentor) {
    return menteeId
      ? MOCK_SUBMITTED_ASSIGNMENTS.filter((a) => a.menteeId === menteeId)
      : MOCK_SUBMITTED_ASSIGNMENTS;
  }
  const user = useAuthStore.getState().user;
  if (user?.role !== 'mentor' || !user?.id) return [];
  const mentorId = Number(user.id);
  if (Number.isNaN(mentorId)) return [];
  try {
    const dashboard = await fetchMentorDashboard(mentorId);
    const list = mapDashboardToSubmittedAssignments(dashboard?.menteeInfoList);
    return menteeId ? list.filter((a) => a.menteeId === menteeId) : list;
  } catch {
    return [];
  }
}

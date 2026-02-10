import { MOCK_MENTEES } from '@/data/mockMentees';
import { useAuthStore } from '@/stores/useAuthStore';
import type { MenteeSummary } from '@/types';

import { API_CONFIG } from './config';
import { fetchMentorDashboard, type MentorDashboardTotalInfo } from './menteeDashboard';
import { fetchMenteeInfo } from './menteeV1';

export type MenteesWithTotalInfo = {
  mentees: MenteeSummary[];
  totalInfo?: MentorDashboardTotalInfo;
  /** 주간 총 과제 수 (menteeInfoList 기준 합산, 이번 주 진행률 계산용) */
  weeklyTotalAssignmentCount?: number;
};

/**
 * 멘토 대시보드 API lastAccess: "며칠 전" 숫자(1, 2, ...) → "N일 전" 문자열
 * (API가 Unix timestamp가 아닌 경과 일수로 내려줄 때 사용)
 */
function formatLastAccessDays(days: number): string {
  if (days <= 0) return '방금 전';
  return `${days} 시간전`;
}

function mapMentorDashboardToMenteeSummaryList(
  dashboard: Awaited<ReturnType<typeof fetchMentorDashboard>>,
): MenteeSummary[] {
  if (!dashboard?.menteeInfoList?.length) return [];
  return dashboard.menteeInfoList.map((item, index) => {
    const b = item.basicInfo;
    // 백엔드가 menteeId를 주면 그대로 사용. 없거나 0이면 index+3으로 URL 일치 (실제 주소 /mentor/mentees/3, 4, ...)
    const id =
      item.menteeId != null && item.menteeId > 0
        ? String(item.menteeId)
        : String(index + 3);
    return {
      id,
      name: b?.menteeName ?? '',
      school: b?.school ?? '',
      grade: b?.menteeGrade ?? '',
      track: '이과',
      desiredMajor: b?.hopeMajor ?? undefined,
      progress: Math.round((b?.assignmentCompleteRate ?? 0) * 100) || 0,
      todaySubmitted: item.todayCompletedAssignmentCount ?? 0,
      todayTotal: item.todayAssignmentCount ?? 0,
      uncheckedCount: 0,
      pendingFeedbackCount: item.waitFeedbackCount ?? 0,
      weeklyAchievement: Math.round((item.weeklyCompletedAssignmentRate ?? 0) * 100) || 0,
      lastActive:
        b?.lastAccess != null && b.lastAccess >= 0
          ? formatLastAccessDays(b.lastAccess)
          : undefined,
      mentoringStart: b?.mentoringStartDate
        ? formatMentoringStartDate(b.mentoringStartDate)
        : undefined,
    } as MenteeSummary;
  });
}

function formatMentoringStartDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${y}년 ${m}월 ${day}일`;
  } catch {
    return iso;
  }
}

function mapMenteeInfoToMenteeSummary(menteeId: string, info: Awaited<ReturnType<typeof fetchMenteeInfo>>): MenteeSummary | null {
  if (!info?.result) return null;
  const r = info.result;

  // 단일 멘티 조회에서도 assignmentAchieveRate / assignmentCompleteRate 모두 지원
  let assignmentRate = r.assignmentAchieveRate ?? 0;
  const rawComplete = (r as any).assignmentCompleteRate as number | undefined;
  if (!assignmentRate && typeof rawComplete === 'number') {
    assignmentRate = rawComplete > 1 ? rawComplete / 100 : rawComplete;
  }

  return {
    id: menteeId,
    name: r.menteeName ?? '',
    school: '',
    grade: r.menteeGrade ?? '',
    progress: Math.round(assignmentRate * 100) || 0,
    todaySubmitted: 0,
    todayTotal: 0,
    uncheckedCount: 0,
    pendingFeedbackCount: 0,
    weeklyAchievement: Math.round(assignmentRate * 100) || 0,
    lastActive:
        r.lastAccess != null && r.lastAccess >= 0
          ? formatLastAccessDays(r.lastAccess)
          : undefined,
    mentoringStart: r.mentoringStartDate ?? undefined,
  } as MenteeSummary;
}

/** 담당 멘티 목록 + 대시보드 totalInfo (주간 완료 등). mock 시 totalInfo 없음 */
export async function fetchMentees(): Promise<MenteesWithTotalInfo> {
  if (API_CONFIG.useMock || API_CONFIG.useMockMentor) {
    return { mentees: MOCK_MENTEES };
  }
  const user = useAuthStore.getState().user;
  if (user?.role !== 'mentor' || !user?.id) return { mentees: [] };
  const mentorId = Number(user.id);
  if (Number.isNaN(mentorId)) return { mentees: [] };
  try {
    const dashboard = await fetchMentorDashboard(mentorId);
    const mentees = mapMentorDashboardToMenteeSummaryList(dashboard);
    const list = dashboard?.menteeInfoList ?? [];
    const weeklyTotalAssignmentCount = list.reduce(
      (sum, m) => sum + (m.weeklyAssignmentCount ?? 0),
      0,
    );
    return {
      mentees,
      totalInfo: dashboard?.totalInfo,
      weeklyTotalAssignmentCount: weeklyTotalAssignmentCount || undefined,
    };
  } catch {
    return { mentees: [] };
  }
}

/** URL/목록에서 쓰이는 menteeId 문자열을 API용 숫자 ID로 변환 (예: "mentee-0" -> 0, "1" -> 1) */
function parseMenteeIdToNumber(menteeId: string): number | null {
  const num = Number(menteeId);
  if (!Number.isNaN(num)) return num;
  const match = /^mentee-(\d+)$/.exec(menteeId);
  return match ? parseInt(match[1], 10) : null;
}

/** menteeId가 "mentee-N" 형태일 때 목록 인덱스 N 반환, 아니면 null */
function getMenteeIndexFromId(menteeId: string): number | null {
  const match = /^mentee-(\d+)$/.exec(menteeId);
  return match ? parseInt(match[1], 10) : null;
}

/** 멘티 상세 조회 (mock 또는 GET /api/v1/{menteeId}). 500/404 시 대시보드 목록에서 폴백 */
export async function fetchMentee(menteeId: string): Promise<MenteeSummary | null> {
  if (API_CONFIG.useMock || API_CONFIG.useMockMentor) {
    return MOCK_MENTEES.find((m) => m.id === menteeId) ?? null;
  }

  const numId = parseMenteeIdToNumber(menteeId);
  if (numId === null) return null;

  try {
    const data = await fetchMenteeInfo(numId);
    const summary = mapMenteeInfoToMenteeSummary(menteeId, data);
    if (summary) return summary;
  } catch {
    /* 상세 API 실패 시 아래 대시보드 폴백 사용 */
  }

  const listIndex = getMenteeIndexFromId(menteeId);
  if (listIndex === null) return null;

  const user = useAuthStore.getState().user;
  if (user?.role !== 'mentor' || !user?.id) return null;
  const mentorId = Number(user.id);
  if (Number.isNaN(mentorId)) return null;

  try {
    const dashboard = await fetchMentorDashboard(mentorId);
    const list = mapMentorDashboardToMenteeSummaryList(dashboard);
    const byIndex = list.find((m) => m.id === menteeId);
    if (byIndex) return byIndex;
    if (listIndex >= 0 && listIndex < list.length) return list[listIndex];
  } catch {
    // 대시보드 500 등 시 null
  }
  return null;
}

import { isApiSuccess } from '@/api/response';

import axiosInstance from './axiosInstance';

/** 멘토 대시보드 - totalInfo */
export interface MentorDashboardTotalInfo {
  totalMentees?: number;
  totalWaitFeedbackCount?: number;
  todayTotalCompletedAssignmentCount?: number;
  todayTotalAssignmentCount?: number;
  weeklyCompleteAssignmentCount?: number;
}

/** 멘토 대시보드 - 멘티 기본 정보 */
export interface MentorDashboardBasicInfo {
  menteeName?: string;
  menteeGrade?: string;
  school?: string;
  hopeMajor?: string;
  lastAccess?: number;
  mentoringStartDate?: string;
  totalStudyTime?: number;
  assignmentCompleteRate?: number;
  averageScore?: number;
}

/** 멘토 대시보드 - 최근 제출 과제 */
export interface RecentSubmittedAssignmentItem {
  assignmentId?: number;
  title?: string;
  submittedAt?: string;
  dueDate?: string;
}

/** 멘토 대시보드 - 멘티 한 명 정보 */
export interface MentorDashboardMenteeInfo {
  menteeId?: number;
  basicInfo?: MentorDashboardBasicInfo;
  todayAssignmentCount?: number;
  todayCompletedAssignmentCount?: number;
  weeklyAssignmentCount?: number;
  weeklyCompletedAssignmentCount?: number;
  weeklyCompletedAssignmentRate?: number;
  waitFeedbackCount?: number;
  recentSubmittedAssignment?: RecentSubmittedAssignmentItem[];
}

export interface MentorDashboardResult {
  totalInfo?: MentorDashboardTotalInfo;
  menteeInfoList?: MentorDashboardMenteeInfo[];
}

/** 멘티 대시보드 - 피드백 항목 */
export interface MenteeDashboardFeedbackItem {
  assignmentId?: number;
  assignmentTitle?: string;
  assignmentStatus?: string;
  submittedAt?: string;
  subject?: string;
}

/** 멘티 대시보드 - 미완료 과제 */
export interface MenteeDashboardNotCompletedAssignment {
  assignmentId?: number;
  title?: string;
  subject?: string;
  dueDate?: string;
}

/** 멘티 대시보드 - 할일 */
export interface MenteeDashboardTodoItem {
  title?: string;
  startAt?: string;
  finishAt?: string;
  status?: string;
}

/** 멘티 대시보드 - 댓글 */
export interface MenteeDashboardCommentItem {
  commentId?: number;
  menteeName?: string;
  content?: string;
  createdAt?: string;
}

export interface MenteeDashboardResult {
  feedbacks?: MenteeDashboardFeedbackItem[];
  notCompletedAssignments?: MenteeDashboardNotCompletedAssignment[];
  todos?: MenteeDashboardTodoItem[];
  comments?: MenteeDashboardCommentItem[];
}

/** 피드백 캘린더 일자 항목 */
export interface MenteeFeedbackCalendarDay {
  date?: string;
  hasFeedback?: boolean;
}

/** 일별 공부시간 항목 */
export interface MenteeTotalTimeCalendarDay {
  date?: string;
  hour?: number;
}

/** 멘티 메인 페이지 결과 */
export interface MenteeMainPageResult {
  name?: string;
  weeklyCompleteRate?: number;
  weeklyTotalStudyTimeHour?: number;
  weeklyTotalStudyTimeMinute?: number;
  weeklyTotalCompletedAssignmentCount?: number;
  weeklyTotalAssignmentCount?: number;
  weeklyCompleteRateBySubject?: { weeklyCompleteRateBySubject?: number; subject?: string }[];
  totalBadgeCount?: number;
}

const api = axiosInstance;

/** 멘토 대시보드 */
export async function fetchMentorDashboard(mentorId: number): Promise<MentorDashboardResult | null> {
  const { data } = await api.get<{ status?: number; code?: string; message?: string; result?: MentorDashboardResult }>(
    `/api/v1/mentor/${mentorId}/dashboard`,
  );
  return isApiSuccess(data) ? data.result ?? null : null;
}

/** 멘티 대시보드 검색 타입: DAY(일별) | MONTH(월별) | WEEK(주별) */
export type MenteeDashboardSearchType = 'DAY' | 'MONTH' | 'WEEK';

/** 멘티 대시보드 (피드백/미완료 과제/할일/댓글) */
export async function fetchMenteeDashboard(
  menteeId: number,
  params: { searchType: MenteeDashboardSearchType; date: string },
): Promise<MenteeDashboardResult | null> {
  const { data } = await api.get<{ status?: number; code?: string; message?: string; result?: MenteeDashboardResult }>(
    `/api/v1/mentee/${menteeId}/dashboard`,
    { params },
  );
  return isApiSuccess(data) ? data.result ?? null : null;
}

/** 멘티 피드백 캘린더 (년월) */
export async function fetchMenteeFeedbackCalendar(
  year: number,
  month: number,
): Promise<MenteeFeedbackCalendarDay[]> {
  const { data } = await api.get<{
    status?: number;
    code?: string;
    message?: string;
    result?: MenteeFeedbackCalendarDay[];
  }>('/api/v1/mentee/feedback/calendar', { params: { year, month } });
  return isApiSuccess(data) && Array.isArray(data.result) ? data.result : [];
}

/** 멘티 일별 공부시간 캘린더 */
export async function fetchMenteeTotalTimeCalendar(date: string): Promise<MenteeTotalTimeCalendarDay[]> {
  const { data } = await api.get<{
    status?: number;
    code?: string;
    message?: string;
    result?: MenteeTotalTimeCalendarDay[];
  }>('/api/v1/mentee/total-time-calendar', { params: { date } });
  return isApiSuccess(data) && Array.isArray(data.result) ? data.result : [];
}

/** 멘티 메인 페이지 */
export async function fetchMenteeMainPage(): Promise<MenteeMainPageResult | null> {
  const { data } = await api.get<{
    status?: number;
    code?: string;
    message?: string;
    result?: MenteeMainPageResult;
  }>('/api/v1/mentee/main-page');
  return isApiSuccess(data) ? data.result ?? null : null;
}

import type {
  AssignmentCreateReq,
  AssignmentSubmitReq,
  GetAllMaterialsSubjectEnum,
  GetMenteeAssignmentsSubjectEnum,
} from '@/generated';
import { MOCK_ASSIGNMENT_DETAILS } from '@/data/menteeDetailMock';
import { getSubjectEnum } from '@/lib/subjectLabels';
import type { AssignmentDetail } from '@/types';

import { API_CONFIG } from './config';
import { isApiSuccess } from './response';

import { assignmentsApi } from './clients';
import axiosInstance from './axiosInstance';

/** 목업 AssignmentDetail → API 형식 (상세 페이지에서 목업 ID 클릭 시 사용) */
function mockDetailToMenteeDetailRes(mock: AssignmentDetail, assignmentId: string): import('@/generated').AssignmentMenteeDetailRes {
  const subjectEnum = getSubjectEnum(mock.subject) as import('@/generated').AssignmentMenteeDetailResSubjectEnum;
  const dueDate = mock.date ? `${mock.date.replace(/\./g, '-')}T23:59:00` : undefined;
  return {
    assignmentId: 0,
    title: mock.title,
    subject: subjectEnum,
    dueDate,
    templateName: mock.goal,
    content: mock.content,
    materials: (mock.providedPdfs ?? []).map((p, i) => ({
      assignmentFileId: i,
      fileType: p.name,
      downloadUrl: undefined,
    })),
    seolStudyContext: mock.studyColumn?.content,
    submittedAt: undefined,
    memo: mock.studentMemo,
    submissions: (mock.studentPhotos ?? []).map((s, i) => ({
      assignmentFileId: i,
      fileType: 'image',
      downloadUrl: s.url,
    })),
  };
}

/** [멘토] 과제 상세 API 응답 (GET /api/v1/assignments/{assignmentId}) */
export interface MentorAssignmentDetailResult {
  assignmentId?: number;
  title?: string;
  subject?: string;
  dueDate?: string;
  templateName?: string;
  content?: string;
  materials?: { assignmentFileId?: number; fileType?: string; downloadUrl?: string }[];
  seolStudyContext?: string;
  submittedAt?: string;
  memo?: string;
  submissions?: { assignmentFileId?: number; fileType?: string; downloadUrl?: string }[];
}

// 과제 생성 (멘토)
export async function createAssignment(body: AssignmentCreateReq) {
  const { data } = await assignmentsApi.createAssignment({ assignmentCreateReq: body });
  return data;
}

// 멘티 과제 목록 조회 (서버가 result를 단일 객체로 줄 수 있어 배열로 정규화)
export async function fetchMenteeAssignments(params?: {
  subject?: AssignmentCreateReq['subject'];
  dueDate?: string;
}) {
  const { data } = await assignmentsApi.getMenteeAssignments({
    subject: params?.subject as GetMenteeAssignmentsSubjectEnum,
    dueDate: params?.dueDate,
  });
  const r = data.result;
  if (Array.isArray(r)) return r;
  if (r != null && typeof r === 'object') return [r];
  return [];
}

// 멘티 과제 상세 조회 (목업 시 문자열 ID 예: "a1" 지원)
export async function fetchMenteeAssignmentDetail(
  assignmentId: string | number,
): Promise<import('@/generated').AssignmentMenteeDetailRes | null> {
  const numId = typeof assignmentId === 'string' ? Number(assignmentId) : assignmentId;
  if (API_CONFIG.useMock && typeof assignmentId === 'string' && assignmentId in MOCK_ASSIGNMENT_DETAILS) {
    const mock = MOCK_ASSIGNMENT_DETAILS[assignmentId];
    return mockDetailToMenteeDetailRes(mock, assignmentId);
  }
  if (!Number.isFinite(numId)) return null;
  const { data } = await assignmentsApi.getMenteeAssignmentDetail({ assignmentId: numId });
  return data.result ?? null;
}

// 과제 제출 (멘티)
export async function submitAssignment(assignmentId: number, body: AssignmentSubmitReq) {
  const { data } = await assignmentsApi.submitAssignment({
    assignmentId,
    assignmentSubmitReq: body,
  });
  return data;
}

// 학습자료 전체 조회 (멘토)
export async function fetchAssignmentMaterials(params?: {
  subject?: AssignmentCreateReq['subject'];
}) {
  const { data } = await assignmentsApi.getAllMaterials({
    subject: params?.subject as GetAllMaterialsSubjectEnum,
  });
  return data.result ?? [];
}

// 파일 다운로드 URL 조회
export async function fetchAssignmentFileDownloadUrl(assignmentFileId: number) {
  const { data } = await assignmentsApi.getAssignmentFileDownloadUrl({ assignmentFileId });
  return data.result ?? null;
}

/** [멘토] 과제 상세 조회 (GET /api/v1/assignments/{assignmentId}) */
export async function fetchMentorAssignmentDetail(
  assignmentId: number,
): Promise<MentorAssignmentDetailResult | null> {
  const { data } = await axiosInstance.get<{
    status?: number;
    code?: string;
    message?: string;
    result?: MentorAssignmentDetailResult;
  }>(`/api/v1/assignments/${assignmentId}`);
  return isApiSuccess(data) ? data.result ?? null : null;
}

// 과제 등록 헬퍼 (AssignmentRegisterPage 전용)
// 폼 데이터 -> API 요청 변환 후 과제 등록
export async function registerAssignment(payload: {
  menteeId: string;
  dateMode: 'single' | 'recurring';
  singleDate?: string;
  singleEndTime?: string;
  recurringDays?: number[];
  recurringStartDate?: string;
  recurringEndDate?: string;
  recurringEndTime?: string;
  title: string;
  templateName: string;
  subject: string;
  content?: string;
  seolStudyColumn?: string;
  fileUrls?: string[];
}): Promise<{ success: boolean; taskIds: string[] }> {
  const menteeId = Number(payload.menteeId);
  const subject = getSubjectEnum(payload.subject) as AssignmentCreateReq['subject'];

  const toReq = (date: string, time: string): AssignmentCreateReq => ({
    menteeId,
    title: payload.title,
    subject,
    dueDate: `${date}T${time}`,
    templateName: payload.templateName,
    content: payload.content,
    seolStudyColumn: payload.seolStudyColumn,
    fileUrls: payload.fileUrls,
  });

  const ids: string[] = [];

  if (payload.dateMode === 'single' && payload.singleDate) {
    const res = await createAssignment(toReq(payload.singleDate, payload.singleEndTime ?? '23:59'));
    if (res.result?.assignmentId != null) ids.push(String(res.result.assignmentId));
  } else if (
    payload.dateMode === 'recurring' &&
    payload.recurringStartDate &&
    payload.recurringEndDate &&
    payload.recurringDays?.length
  ) {
    const time = payload.recurringEndTime ?? '23:59';
    const start = new Date(payload.recurringStartDate);
    const end = new Date(payload.recurringEndDate);
    const dates: string[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (payload.recurringDays.includes(d.getDay())) {
        dates.push(d.toISOString().split('T')[0]);
      }
    }

    const results = await Promise.all(dates.map((date) => createAssignment(toReq(date, time))));
    for (const res of results) {
      if (res.result?.assignmentId != null) ids.push(String(res.result.assignmentId));
    }
  }

  return { success: true, taskIds: ids };
}

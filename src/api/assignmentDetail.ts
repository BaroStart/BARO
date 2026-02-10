import type { AssignmentDetail } from '@/types';

import { MOCK_ASSIGNMENT_DETAILS } from '@/data/menteeDetailMock';

import { API_CONFIG } from './config';
import { fetchMentorAssignmentDetail, type MentorAssignmentDetailResult } from './assignments';

function mapMentorDetailToAssignmentDetail(
  assignmentId: string,
  r: MentorAssignmentDetailResult,
): AssignmentDetail {
  const dueDate = r.dueDate ? new Date(r.dueDate) : null;
  const dateStr = dueDate ? dueDate.toISOString().split('T')[0] : '';
  return {
    assignmentId,
    title: r.title ?? '',
    subject: r.subject ?? '',
    date: dateStr,
    goal: r.templateName ?? '',
    content: r.content ?? '',
    providedPdfs: (r.materials ?? []).map((m) => ({
      id: String(m.assignmentFileId ?? ''),
      name: m.fileType ?? '파일',
      size: undefined,
    })),
    studentPhotos: (r.submissions ?? []).map((m) => ({
      id: String(m.assignmentFileId ?? ''),
      url: m.downloadUrl ?? '',
      caption: undefined,
    })),
    studentMemo: r.memo,
    studyColumn: r.seolStudyContext
      ? { title: '학습 컨텍스트', content: r.seolStudyContext }
      : undefined,
  };
}

/** 과제 상세 조회 (mock 또는 GET /api/v1/assignments/{assignmentId}) */
export async function fetchAssignmentDetail(
  _menteeId: string,
  assignmentId: string,
): Promise<AssignmentDetail | null> {
  if (API_CONFIG.useMock || API_CONFIG.useMockMentor) {
    return MOCK_ASSIGNMENT_DETAILS[assignmentId] ?? null;
  }
  const numId = Number(assignmentId);
  if (Number.isNaN(numId)) return null;
  try {
    const result = await fetchMentorAssignmentDetail(numId);
    return result ? mapMentorDetailToAssignmentDetail(assignmentId, result) : null;
  } catch {
    return null;
  }
}

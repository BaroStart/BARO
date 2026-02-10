import type { AssignmentMenteeDetailRes, AssignmentMenteeListRes } from '@/generated';
import type { AssignmentDetail } from '@/types';

import { getSubjectLabel } from './subjectLabels';

// ── 상태 변환 ──

function mapStatus(status?: string): string {
  if (status === 'NOT_SUBMIT') return '미완료';
  return '완료'; // SUBMITTED, FEEDBACKED
}

function mapLocalStatus(status?: string): 'completed' | 'not_started' {
  if (status === 'NOT_SUBMIT') return 'not_started';
  return 'completed';
}

// ── 날짜 포맷 ──

/** ISO 날짜 → "2026.02.09" */
function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

/** ISO 날짜 → "2026.02.09 14:30" */
function formatDateTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const datePart = formatDate(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${datePart} ${h}:${min}`;
}

/** ISO → "YYYY-MM-DD" */
function toYmd(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** ISO → 마감 시간 텍스트 ("오후 11:59") */
function formatDeadlineTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h < 12 ? '오전' : '오후';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${period} ${h12}:${String(m).padStart(2, '0')}`;
}

// ── 목록 매핑 ──

export interface MappedAssignmentListItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  status: '완료' | '미완료';
  /** 마감일 또는 제출일 표시 텍스트 */
  submissionDate: string;
  /** YYYY-MM-DD (날짜 필터용) */
  deadlineDate: string;
  /** 마감 시간 텍스트 (예: "오후 11:59") */
  deadline: string;
  /** 완료 시간 텍스트 */
  completedAt?: string;
  completedAtDate?: string;
  /** 원본 localStatus */
  localStatus: 'completed' | 'not_started';
}

export function mapListRes(res: AssignmentMenteeListRes): MappedAssignmentListItem {
  const subject = getSubjectLabel(res.subject);
  const status = mapStatus(res.status) as '완료' | '미완료';
  const localStatus = mapLocalStatus(res.status);

  // dueDate가 목록 응답에는 없으므로 submittedAt으로 대체
  const submissionDate = res.submittedAt ? formatDateTime(res.submittedAt) : '';
  const deadlineDate = res.submittedAt ? toYmd(res.submittedAt) : '';
  const deadline = '';
  const completedAt = res.submittedAt ? formatDeadlineTime(res.submittedAt) : undefined;
  const completedAtDate = res.submittedAt ? toYmd(res.submittedAt) : undefined;

  return {
    id: String(res.assignmentId ?? ''),
    subject,
    title: res.title ?? '',
    description: res.content ?? res.templateName ?? '',
    status,
    submissionDate,
    deadlineDate,
    deadline,
    completedAt,
    completedAtDate,
    localStatus,
  };
}

// ── 상세 매핑 ──

/** API 상세 응답 → 글로벌 Assignment 타입 (헤더/탭용) */
export function mapDetailToAssignment(res: AssignmentMenteeDetailRes): Assignment {
  const subject = getSubjectLabel(res.subject);
  const isDone = !!res.submittedAt;
  const submissionDate = isDone ? formatDateTime(res.submittedAt) : formatDate(res.dueDate);

  return {
    id: String(res.assignmentId ?? ''),
    subject,
    title: res.title ?? '',
    description: res.templateName ?? '',
    submissionDate,
    status: isDone ? '완료' : '미완료',
  };
}

/** API 상세 응답 → AssignmentDetail 타입 (콘텐츠용) */
export function mapDetailToAssignmentDetail(res: AssignmentMenteeDetailRes): AssignmentDetail {
  const materials = res.materials ?? [];
  const submissions = res.submissions ?? [];

  return {
    assignmentId: String(res.assignmentId ?? ''),
    title: res.title ?? '',
    subject: getSubjectLabel(res.subject),
    date: formatDate(res.dueDate),
    goal: res.templateName ?? '',
    content: res.content ?? '',
    providedPdfs: materials.map((m) => ({
      id: String(m.assignmentFileId ?? ''),
      name: m.fileType ?? 'file',
      size: undefined,
    })),
    studentPhotos: submissions.map((s) => ({
      id: String(s.assignmentFileId ?? ''),
      url: s.downloadUrl ?? '',
    })),
    studentMemo: res.memo ?? undefined,
    studyColumn: res.seolStudyContext
      ? { title: '설스터디 가이드', content: res.seolStudyContext }
      : undefined,
  };
}

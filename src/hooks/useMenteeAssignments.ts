import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchMenteeAssignmentDetail,
  fetchMenteeAssignments,
  submitAssignment,
} from '@/api/assignments';
import { getPreAuthenticatedUrl } from '@/api/storages';
import type { AssignmentSubmitReq } from '@/generated';
import axiosInstance from '@/api/axiosInstance';

// ── 목록 조회 ──

export function useMenteeAssignments(
  params?: { subject?: string; dueDate?: string },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['menteeAssignments', params],
    queryFn: () => fetchMenteeAssignments(params),
    enabled: options?.enabled ?? true,
  });
}

// ── 상세 조회 ──

export function useMenteeAssignmentDetail(assignmentId?: string | number) {
  const id = assignmentId === undefined || assignmentId === '' ? undefined : assignmentId;

  return useQuery({
    queryKey: ['menteeAssignmentDetail', id],
    queryFn: () => fetchMenteeAssignmentDetail(id!),
    enabled: id !== undefined,
  });
}

// ── 파일 업로드 ──

async function uploadFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `submissions/${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`;

  const res = await getPreAuthenticatedUrl(fileName);
  const uploadUrl = res.result?.url;
  if (!uploadUrl) throw new Error('파일 업로드 URL 발급 실패');

  // Pre-Authenticated URL로 직접 PUT 업로드
  await axiosInstance.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  });

  // 업로드된 파일 URL 반환 (쿼리 파라미터 제거)
  return uploadUrl.split('?')[0];
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadFile));
}

// ── 과제 제출 ──

export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      memo,
      files,
    }: {
      assignmentId: number;
      memo?: string;
      files?: File[];
    }) => {
      // 1. 파일 업로드
      const fileUrls = files && files.length > 0 ? await uploadFiles(files) : undefined;

      // 2. 과제 제출
      const body: AssignmentSubmitReq = {
        memo: memo || undefined,
        fileUrls,
      };

      return submitAssignment(assignmentId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menteeAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['menteeAssignmentDetail'] });
    },
  });
}

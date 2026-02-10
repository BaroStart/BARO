import type {
  AssignmentTemplateCreateReq,
  AssignmentTemplateDetailRes,
  AssignmentTemplateListRes,
  AssignmentTemplateUpdateReq,
  GetTemplateListSubjectEnum,
} from '@/generated';

import { assignmentTemplatesApi } from './clients';

// 과제 템플릿(과제 목표) 목록 조회
export async function fetchTemplateList(subject?: string): Promise<AssignmentTemplateListRes[]> {
  const { data } = await assignmentTemplatesApi.getTemplateList({
    subject: subject as GetTemplateListSubjectEnum,
  });
  return data.result ?? [];
}

// 과제 템플릿 상세 조회
export async function fetchTemplateDetail(id: number): Promise<AssignmentTemplateDetailRes | null> {
  const { data } = await assignmentTemplatesApi.getTemplateDetail({ id });
  return data.result ?? null;
}

// 과제 템플릿 생성
export async function createTemplate(
  req: AssignmentTemplateCreateReq,
): Promise<AssignmentTemplateDetailRes | null> {
  const { data } = await assignmentTemplatesApi.createTemplate({
    assignmentTemplateCreateReq: req,
  });
  return data.result ?? null;
}

// 과제 템플릿 수정
export async function updateTemplate(
  id: number,
  req: AssignmentTemplateUpdateReq,
): Promise<AssignmentTemplateDetailRes | null> {
  const { data } = await assignmentTemplatesApi.updateTemplate({
    id,
    assignmentTemplateUpdateReq: req,
  });
  return data.result ?? null;
}

// 과제 템플릿 삭제
export async function deleteTemplate(id: number): Promise<void> {
  await assignmentTemplatesApi.deleteTemplate({ id });
}

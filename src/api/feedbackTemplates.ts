import type {
  FeedbackTemplateCreateReq,
  FeedbackTemplateListRes,
  FeedbackTemplateRes,
  FeedbackTemplateUpdateReq,
  GetTemplatesSubjectEnum,
} from '@/generated';

import { feedbackTemplatesApi } from './clients';

export async function fetchFeedbackTemplateList(
  subject?: string,
): Promise<FeedbackTemplateListRes[]> {
  const { data } = await feedbackTemplatesApi.getTemplates({
    subject: subject as GetTemplatesSubjectEnum,
  });
  return data.result ?? [];
}

export async function fetchFeedbackTemplateDetail(
  id: number,
): Promise<FeedbackTemplateRes | null> {
  const { data } = await feedbackTemplatesApi.getTemplate({ templateId: id });
  return data.result ?? null;
}

export async function createFeedbackTemplate(
  req: FeedbackTemplateCreateReq,
): Promise<FeedbackTemplateRes | null> {
  const { data } = await feedbackTemplatesApi.create1({ feedbackTemplateCreateReq: req });
  return data.result ?? null;
}

export async function updateFeedbackTemplate(
  id: number,
  req: FeedbackTemplateUpdateReq,
): Promise<FeedbackTemplateRes | null> {
  const { data } = await feedbackTemplatesApi.update({
    templateId: id,
    feedbackTemplateUpdateReq: req,
  });
  return data.result ?? null;
}

export async function deleteFeedbackTemplateById(id: number): Promise<void> {
  await feedbackTemplatesApi._delete({ templateId: id });
}

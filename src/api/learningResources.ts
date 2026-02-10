import type { LearningResourceCreateReq } from '@/generated';

import { learningResourcesApi } from './clients';

export async function fetchLearningResources() {
  const { data } = await learningResourcesApi.getList();
  return data.result ?? [];
}

export async function createLearningResource(body: LearningResourceCreateReq) {
  const { data } = await learningResourcesApi.create({ learningResourceCreateReq: body });
  return data;
}

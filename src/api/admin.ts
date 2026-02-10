import { isApiSuccess } from './response';

import { adminApi } from './clients';

/** 테스트용 멘토-멘티 매핑 (POST /admin/mapping) */
export async function mappingMentorMentee(
  mentorId: number,
  menteeId: number,
): Promise<boolean> {
  const { data } = await adminApi.mappingMentorMentee({ mentorId, menteeId });
  return isApiSuccess(data);
}

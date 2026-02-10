import { isApiSuccess } from '@/api/response';
import { getPreAuthenticatedUrl } from '@/api/storages';

export async function uploadFileViaPreAuthenticatedUrl(params: {
  file: File;
  fileName: string;
}): Promise<{ uploadUrl: string }> {
  const { file, fileName } = params;

  const pre = await getPreAuthenticatedUrl(fileName);
  if (!isApiSuccess(pre) || !pre.result?.url) {
    throw new Error(pre.message || '업로드 URL 발급에 실패했습니다.');
  }

  const uploadUrl = pre.result.url;

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });

  if (!res.ok) {
    throw new Error(`파일 업로드 실패 (HTTP ${res.status})`);
  }

  return { uploadUrl };
}

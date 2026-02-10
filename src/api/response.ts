export type ApiEnvelopeLike = {
  status?: number;
  code?: string;
  message?: string;
};

export function isApiSuccess(res: ApiEnvelopeLike | null | undefined): boolean {
  if (!res) return false;
  // swagger 예시는 status=0 이었지만, 실제 서버는 status=200/201 형태를 쓰는 듯함
  if (res.code === 'OK') return true;
  if (typeof res.status === 'number') {
    if (res.status === 0) return true;
    if (res.status >= 200 && res.status < 300) return true;
  }
  return false;
}


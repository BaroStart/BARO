import { STORAGE_KEYS } from '@/constants';

/** 프로필 사진을 sessionStorage에 저장 (탭 유지, 새로고침 시 유지) */
export function getLocalProfileImage(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.MENTEE_PROFILE_IMAGE_LOCAL);
  } catch {
    return null;
  }
}

export function setLocalProfileImage(dataUrl: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.MENTEE_PROFILE_IMAGE_LOCAL, dataUrl);
  } catch {
    // ignore
  }
}

export function clearLocalProfileImage(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.MENTEE_PROFILE_IMAGE_LOCAL);
  } catch {
    // ignore
  }
}

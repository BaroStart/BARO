import axios from 'axios';

import { useApiErrorStore } from '@/stores/useApiErrorStore';
import { useAuthStore } from '@/stores/useAuthStore';

import { refresh as refreshApi } from './auth';
import { API_CONFIG } from './config';
import { isApiSuccess } from './response';

const axiosInstance = axios.create({
  // 개발에서는 Vite 프록시(`/api -> backend`)를 타므로 baseURL은 비우고,
  // 각 API 함수에서 `/api/...` 경로를 그대로 사용한다.
  // 배포에서는 VITE_API_URL이 설정되어 absolute baseURL로 호출한다.
  baseURL: API_CONFIG.baseURL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function isPublicAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  // baseURL이 '/api'일 수도 있고, 절대 URL일 수도 있으니 "포함"으로 체크
  return (
    url.includes('/api/v1/login') ||
    url.includes('/api/v1/signup') ||
    url.includes('/api/v1/refresh')
  );
}

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  // 로그인/회원가입/리프레시는 토큰을 붙이지 않음 (백엔드 필터가 Authorization을 보고 403 내는 케이스 방지)
  if (token && !isPublicAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshTokens(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await refreshApi(refreshToken);
      if (!isApiSuccess(res) || !res.result?.accessToken) return null;
      useAuthStore.getState().setTokens(res.result.accessToken, res.result.refreshToken ?? null);
      return res.result.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // 401이면 1회에 한해 refresh 시도 후 재요청
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await tryRefreshTokens();
        if (newAccessToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch {
        // ignore and fall through to logout
      }

      useAuthStore.getState().logout();
      return Promise.reject(error);
    } else {
      const message =
        error.response?.data?.message ?? error.message ?? '요청을 처리하는 중 오류가 발생했습니다.';
      useApiErrorStore.getState().setError(message, status);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

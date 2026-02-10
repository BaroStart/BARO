import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { API_CONFIG } from '@/api/config';
import { login as loginApi } from '@/api/auth';
import { STORAGE_KEYS } from '@/constants';
import type { User, UserRole } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null; // TODO: JWT 토큰용
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (role: UserRole, userId?: string) => void;
  loginWithCredentials: (
    id: string,
    password: string,
    role: UserRole,
  ) => Promise<{ success: true } | { success: false; reason: 'role_mismatch' | 'invalid_credentials' }>;
  setToken: (token: string) => void; // TODO: JWT 토큰 설정용
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setProfileImage: (url: string | null) => void;
  logout: () => void;
}

// MVP 테스트용: mentee01, mentee02, mentor01 / 멘토 ee, 멘티 rr, uu / PW: test1234
const MOCK_ACCOUNTS: Record<string, { user: User; password: string }> = {
  mentee01: {
    user: { id: 's1', name: '멘티1', role: 'mentee', school: 'OO고' },
    password: 'test1234',
  },
  mentee02: {
    user: { id: 's2', name: '멘티2', role: 'mentee', school: 'OO고' },
    password: 'test1234',
  },
  mentor01: {
    user: {
      id: 'm1',
      name: '김멘토',
      role: 'mentor',
      school: '서울대학교 의과대학',
      subject: '국어' as const,
    },
    password: 'test1234',
  },
  // 멘토 ee / 멘티 rr, uu (아이디·비밀번호 동일: ee/ee, rr/rr, uu/uu)
  ee: {
    user: {
      id: 'ee',
      name: '멘토',
      role: 'mentor',
      school: '',
      subject: '국어' as const,
    },
    password: 'ee',
  },
  rr: {
    user: { id: 'rr', name: '멘티', role: 'mentee', school: '' },
    password: 'rr',
  },
  uu: {
    user: { id: 'uu', name: '멘티', role: 'mentee', school: '' },
    password: 'uu',
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (role: UserRole, userId?: string) => {
        if (role === 'mentor') {
          set({ user: MOCK_ACCOUNTS.mentor01.user, isAuthenticated: true });
        } else {
          const mentee =
            userId === 's2' ? MOCK_ACCOUNTS.mentee02.user : MOCK_ACCOUNTS.mentee01.user;
          set({ user: mentee, isAuthenticated: true });
        }
      },
      loginWithCredentials: async (
        id: string,
        password: string,
        role: UserRole,
      ): Promise<{ success: true } | { success: false; reason: 'role_mismatch' | 'invalid_credentials' }> => {
        const loginId = id.trim();
        // 전체 기능은 mock이어도, Auth만 실 API로 붙일 수 있게 분리
        if (API_CONFIG.useMockAuth) {
          const account = MOCK_ACCOUNTS[loginId];
          if (!account || account.password !== password)
            return { success: false, reason: 'invalid_credentials' };
          if (role === 'mentor' && account.user.role !== 'mentor')
            return { success: false, reason: 'role_mismatch' };
          if (role === 'mentee' && account.user.role !== 'mentee')
            return { success: false, reason: 'role_mismatch' };
          set({ user: account.user, isAuthenticated: true });
          return { success: true };
        }

        try {
          const res = await loginApi({ loginId, password });
          // result 래핑 여부와 관계없이 accessToken 추출 (서버가 { result: { ... } } 또는 { accessToken, ... } 반환 가능)
          const result = (res?.result ?? res) as {
            userId?: number;
            accessToken?: string;
            refreshToken?: string;
            name?: string;
            role?: string;
            userType?: string;
          };
          if (!result?.accessToken)
            return { success: false, reason: 'invalid_credentials' };

          // 백엔드가 역할을 주면 선택한 역할과 일치하는지 검사 (멘토↔멘티 교차 로그인 방지)
          const serverRoleRaw = result?.role ?? result?.userType;
          const serverRoleStr =
            serverRoleRaw != null && String(serverRoleRaw).trim() ? String(serverRoleRaw).toLowerCase() : null;
          const asUserRole: UserRole | null =
            serverRoleStr === 'mentor' ? 'mentor' : serverRoleStr === 'mentee' ? 'mentee' : null;

          if (asUserRole != null && asUserRole !== role)
            return { success: false, reason: 'role_mismatch' };
          // 서버가 역할을 안 주면 선택한 역할 사용 (백엔드가 result에 role 미포함 시 로그인 허용)
          const resolvedRole: UserRole = asUserRole ?? role;

          let displayName: string =
            (result?.name && String(result.name).trim()) || loginId;
          if (displayName === loginId) {
            try {
              const raw = localStorage.getItem(STORAGE_KEYS.SIGNUP_NAME_BY_LOGIN_ID);
              const map = raw ? (JSON.parse(raw) as Record<string, string>) : null;
              if (map?.[loginId]) displayName = map[loginId];
            } catch {
              // ignore
            }
          }

          const userId = result?.userId != null ? String(result.userId) : loginId;

          set({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken ?? null,
            user: { id: userId, name: displayName, role: resolvedRole },
            isAuthenticated: true,
          });

          return { success: true };
        } catch {
          return { success: false, reason: 'invalid_credentials' };
        }
      },
      setToken: (token: string) => {
        set({ accessToken: token });
      },
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },
      setProfileImage: (url) => {
        set((s) => (s.user ? { user: { ...s.user, profileImage: url ?? undefined } } : s));
      },
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: STORAGE_KEYS.AUTH,
    },
  ),
);

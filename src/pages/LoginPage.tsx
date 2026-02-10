import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Eye, EyeOff } from 'lucide-react';

import { API_CONFIG } from '@/api/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UserRole } from '@/types/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithCredentials } = useAuthStore();
  const [role, setRole] = useState<UserRole>('mentee');
  const [id, setId] = useState(() => (API_CONFIG.useMockAuth ? 'mentee01' : ''));
  const [password, setPassword] = useState(() => (API_CONFIG.useMockAuth ? 'test1234' : ''));
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (API_CONFIG.useMockAuth) {
      setId(newRole === 'mentor' ? 'mentor01' : 'mentee01');
      setPassword('test1234');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const loginId = id.trim();
    if (!loginId) {
      setError('아이디를 입력해주세요.');
      return;
    }
    const result = await loginWithCredentials(loginId, password, role);
    if (result.success) {
      navigate(role === 'mentor' ? '/mentor' : '/mentee', { replace: true });
    } else if (result.reason === 'role_mismatch') {
      setError(
        role === 'mentor'
          ? '멘티 계정으로는 멘토 로그인을 할 수 없습니다. 멘티로 시작하기를 선택해주세요.'
          : '멘토 계정으로는 멘티 로그인을 할 수 없습니다. 멘토로 관리하기를 선택해주세요.',
      );
    } else {
      setError('아이디 또는 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      {/* 부드러운 그라데이션 배경 — 과하지 않게 */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(165deg, #f8fafc 0%, #ffffff 35%, #f0f9ff 70%, #e0f2fe 100%)',
        }}
      />
      <div
        className="absolute -right-[20%] -top-[20%] h-[60%] w-[60%] -z-10 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(193 70% 85%) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-[15%] -left-[15%] h-[50%] w-[50%] -z-10 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(193 60% 90%) 0%, transparent 70%)' }}
      />

      {/* 로고 + SeolStudy (Plus Jakarta Sans) */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img src="/logo.svg" alt="" className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
          <span
            className="font-plus-jakarta text-4xl font-black tracking-tight text-slate-800 sm:text-5xl"
            style={{
              WebkitTextStroke: '1px hsl(222 47% 11% / 0.08)',
              letterSpacing: '-0.02em',
            }}
          >
            SeolStudy
          </span>
        </div>
        <p className="mt-3 text-center text-sm text-slate-500 sm:text-base">
          습관으로 쌓는 오늘, 목표로 가는 내일
          <br />
          오늘도 당신의 꿈을 응원합니다
        </p>
      </div>

      <div className="mb-8 mt-8 sm:mb-10 sm:mt-10" />

      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => handleRoleChange('mentee')}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition ${
              role === 'mentee'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            멘티로 시작하기
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('mentor')}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition ${
              role === 'mentor'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            멘토로 관리하기
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="id"
            label="아이디"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디를 입력하세요"
            autoComplete="username"
            className="h-10 rounded-lg bg-white text-sm"
            labelClassName="text-xs font-medium text-slate-500"
          />

          <Input
            id="password"
            label="비밀번호"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
            className="h-10 rounded-lg bg-white pr-10 text-sm"
            labelClassName="text-xs font-medium text-slate-500"
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="rounded p-1 text-slate-400 transition-colors hover:text-slate-600"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            }
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full">
            로그인
          </Button>

          <p className="pt-2 text-center text-sm text-slate-600">
            아직 계정이 없나요?{' '}
            <Link
              to="/signup"
              state={{ role }}
              className="font-semibold text-slate-900 underline underline-offset-4"
            >
              회원가입
            </Link>
          </p>
        </form>
      </div>

      <p className="mt-12 text-center text-xs text-slate-500/80">
        계정 문의는 운영자에게 문의해주세요
      </p>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import type { UserRole } from '@/types/auth';

import { API_CONFIG } from '@/api/config';
import { signup } from '@/api/auth';
import { isApiSuccess } from '@/api/response';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { STORAGE_KEYS } from '@/constants';

type FormState = {
  loginId: string;
  password: string;
  name: string;
  nickname: string;
  joinType: string;
  grade: string;
  school: string;
  hopeMajor: string;
  university: string;
};

const GRADES = ['FIRST', 'SECOND', 'THIRD'] as const;
const SCHOOLS = ['NORMAL', 'SPECIAL', 'PRIVATE', 'ETC'] as const;

export function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const roleFromLogin = (location.state as { role?: UserRole } | null)?.role;
  const initialJoinType =
    roleFromLogin === 'mentee' ? 'MENTEE' : roleFromLogin === 'mentor' ? 'MENTOR' : 'MENTOR';

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const [form, setForm] = useState<FormState>({
    loginId: '',
    password: '',
    name: '',
    nickname: '',
    joinType: initialJoinType,
    grade: 'FIRST',
    school: 'NORMAL',
    hopeMajor: '',
    university: '',
  });

  useEffect(() => {
    if (roleFromLogin != null) {
      setForm((prev) => ({ ...prev, joinType: roleFromLogin === 'mentee' ? 'MENTEE' : 'MENTOR' }));
    }
  }, [roleFromLogin]);

  const isMentee = form.joinType === 'MENTEE';

  const joinTypeLabel = useMemo(
    () => (form.joinType === 'MENTOR' ? '멘토' : '멘티'),
    [form.joinType],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (API_CONFIG.useMockAuth) {
      setError('현재 VITE_USE_MOCK_AUTH=true 입니다. 실제 회원가입을 하려면 VITE_USE_MOCK_AUTH=false로 변경하세요.');
      return;
    }

    if (!form.loginId.trim() || !form.password.trim() || !form.name.trim() || !form.nickname.trim()) {
      setError('필수 항목(아이디/비밀번호/이름/닉네임)을 입력해 주세요.');
      return;
    }
    if (!form.university.trim()) {
      setError('필수 항목(대학교)을 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      // name: API에 전달되는 실명(사용자 입력값). 역할(멘토/멘티)이 아님.
      const signupPayload = {
        loginId: form.loginId.trim(),
        password: form.password,
        name: form.name.trim(),
        nickname: form.nickname.trim(),
        joinType: form.joinType,
        grade: form.grade,
        school: form.school,
        hopeMajor: isMentee ? form.hopeMajor.trim() : form.hopeMajor.trim(),
        university: form.university.trim(),
      };
      const res = await signup(signupPayload);

      if (!isApiSuccess(res)) {
        setError(res.message || '회원가입에 실패했습니다.');
        return;
      }

      // 로그인 API가 user 정보를 주지 않아, 회원가입 때 입력한 이름을 로컬에 매핑으로 저장
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SIGNUP_NAME_BY_LOGIN_ID);
        const map = (raw ? (JSON.parse(raw) as Record<string, string>) : {}) ?? {};
        map[form.loginId.trim()] = form.name.trim();
        localStorage.setItem(STORAGE_KEYS.SIGNUP_NAME_BY_LOGIN_ID, JSON.stringify(map));
      } catch {
        // storage가 막혀있어도 회원가입 자체는 진행
      }

      setSuccessMsg('회원가입이 완료되었습니다. 로그인 해주세요.');
      setTimeout(() => navigate('/login'), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8 sm:px-6 sm:py-12">
      <img src="/logo.svg" alt="설스터디" className="h-14 sm:h-16" />
      <h1 className="mt-3 text-xl font-bold text-slate-800 sm:text-2xl">회원가입</h1>
      <p className="mt-2 mb-8 text-slate-500 sm:mb-10">
        {joinTypeLabel} 계정을 생성합니다
      </p>

      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => update('joinType', 'MENTEE')}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition ${
              form.joinType === 'MENTEE'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            멘티
          </button>
          <button
            type="button"
            onClick={() => update('joinType', 'MENTOR')}
            className={`flex-1 rounded-md py-2.5 text-sm font-medium transition ${
              form.joinType === 'MENTOR'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            멘토
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="signup-loginId"
            label="아이디"
            value={form.loginId}
            onChange={(e) => update('loginId', e.target.value)}
            placeholder="예: baro1234"
            autoComplete="username"
          />
          <Input
            id="signup-password"
            label="비밀번호"
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="비밀번호"
            autoComplete="new-password"
          />
          <Input
            id="signup-name"
            label="이름 (실명)"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="예: baro"
            autoComplete="name"
          />
          <Input
            id="signup-nickname"
            label="닉네임"
            value={form.nickname}
            onChange={(e) => update('nickname', e.target.value)}
            placeholder="예: baro1234"
          />

          {/* 멘티 추가정보 */}
          {isMentee && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>학년</Label>
                  <select
                    value={form.grade}
                    onChange={(e) => update('grade', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>학교 유형</Label>
                  <select
                    value={form.school}
                    onChange={(e) => update('school', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    {SCHOOLS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Input
                id="signup-hopeMajor"
                label="희망 전공"
                value={form.hopeMajor}
                onChange={(e) => update('hopeMajor', e.target.value)}
                placeholder="예: medical"
              />
            </div>
          )}

          <Input
            id="signup-university"
            label="대학교"
            value={form.university}
            onChange={(e) => update('university', e.target.value)}
            placeholder="예: 서울대"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
          {successMsg && <p className="text-sm text-emerald-600">{successMsg}</p>}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? '가입 중...' : '회원가입'}
          </Button>

          <p className="text-center text-sm text-slate-600">
            이미 계정이 있나요?{' '}
            <Link to="/login" className="font-semibold text-slate-900 underline underline-offset-4">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}


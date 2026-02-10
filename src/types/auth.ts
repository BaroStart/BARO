export type UserRole = 'mentor' | 'mentee';

/** 멘토 담당 과목 (국어/영어/수학) */
export type MentorSubject = '국어' | '영어' | '수학';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  school?: string;
  profileImage?: string;
  subject?: MentorSubject;
}

/** 표시할 이름(님 제외). UI에서 "{getDisplayName(user)}님" 형태로 사용 */
export function getDisplayName(user: User | null): string {
  if (!user) return '멘티';
  const roleFallback = user.role === 'mentor' ? '멘토' : '멘티';
  const name = (user.name || '').trim();
  if (!name) return roleFallback;
  if (name === user.id) return roleFallback;
  // 로그인 ID처럼 보이는 경우(2글자 이하 영문·숫자): 역할명 사용
  if (name.length <= 2 && /^[a-zA-Z0-9]+$/.test(name)) return roleFallback;
  return name;
}

/** 홈 환영 문구: 이름이 있으면 "이름님", 없으면 "멘토님" / "멘티님" (대시보드 이름 표시용) */
export function getWelcomeTitle(user: User | null): string {
  // if (!user) return '멘티님';
  // const name = getDisplayName(user);
  // const roleSuffix = user.role === 'mentor' ? '멘토님' : '멘티님';
  // const isRoleFallback = name === '멘토' || name === '멘티';
  // if (isRoleFallback) return roleSuffix;
  if (user === null) return '멘토님';
  return `${user.name}님`;
}

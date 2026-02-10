// 과목별 색상 테마
export const SUBJECT_THEME: Record<string, { iconBg: string; iconText: string; label: string }> = {
  국어: { iconBg: 'bg-rose-50', iconText: 'text-rose-500', label: 'text-rose-500' },
  영어: { iconBg: 'bg-amber-50', iconText: 'text-amber-500', label: 'text-amber-600' },
  수학: { iconBg: 'bg-sky-50', iconText: 'text-sky-500', label: 'text-sky-500' },
};

export const DEFAULT_THEME = {
  iconBg: 'bg-slate-50',
  iconText: 'text-slate-400',
  label: 'text-slate-500',
};

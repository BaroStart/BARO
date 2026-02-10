// 백엔드 과목 enum ↔ 한글 라벨 변환
export const SUBJECT_LABELS: Record<string, string> = {
  KOREAN: '국어',
  ENGLISH: '영어',
  MATH: '수학',
  COMMON: '공통',
};

// 한글 → enum (과제 등록 등에서 사용)
export const SUBJECT_ENUM: Record<string, string> = {
  국어: 'KOREAN',
  영어: 'ENGLISH',
  수학: 'MATH',
  공통: 'COMMON',
};

export function getSubjectLabel(enumValue?: string | null): string {
  return SUBJECT_LABELS[enumValue ?? ''] ?? enumValue ?? '';
}

export function getSubjectEnum(label: string): string {
  return SUBJECT_ENUM[label] ?? 'COMMON';
}

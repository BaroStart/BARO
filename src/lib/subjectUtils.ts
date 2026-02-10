import type { ReactNode } from 'react';
import { createElement } from 'react';

import { EnglishIcon, KoreanIcon, MathIcon } from '@/components/icons';

type SubjectEnum = 'KOREAN' | 'ENGLISH' | 'MATH';

const SUBJECT_ENUM_MAP: Record<string, SubjectEnum> = {
  국어: 'KOREAN',
  영어: 'ENGLISH',
  수학: 'MATH',
};

const SUBJECT_ICON_MAP: Record<string, typeof KoreanIcon> = {
  국어: KoreanIcon,
  영어: EnglishIcon,
  수학: MathIcon,
};

// 한글 과목명 → enum
export function toSubjectEnum(korean: string): SubjectEnum | null {
  return SUBJECT_ENUM_MAP[korean] ?? null;
}

// 과목별 아이콘 렌더링
export function getSubjectIcon(subject: string, className: string): ReactNode {
  const Icon = SUBJECT_ICON_MAP[subject] ?? MathIcon;
  return createElement(Icon, { className });
}

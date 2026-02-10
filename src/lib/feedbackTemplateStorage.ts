/**
 * 피드백 템플릿 로컬 저장소
 * 백엔드 API 연동 전까지 클라이언트에서 저장
 */

const STORAGE_KEY = 'feedback-templates';

export type FeedbackTemplateSubject = '국어' | '영어' | '수학' | '공통';

export interface FeedbackTemplate {
  id: string;
  name: string;
  subject: FeedbackTemplateSubject;
  content: string;
  createdAt: string;
  useCount: number;
  isDefault?: boolean;
}

/** 기본 템플릿 본문 구조 */
export const DEFAULT_TEMPLATE_CONTENT = `[잘한 점]
• 문제 접근 방식이 논리적이었음
• 계산 실수가 줄어들고 있음

[보완할 점]
• 시간 관리가 아쉬움
• 다음에는 풀이 순서를 먼저 정리해볼 것

[다음 목표]

[특이사항]`;

const MOCK_TEMPLATES: FeedbackTemplate[] = [
  {
    id: 't1',
    name: '수학 오답 분석 (기본 템플릿)',
    subject: '수학',
    content:
      '오늘 학습한 문제들에 대한 분석입니다. 특히 [문제번호]에서 [개념]에 대한 이해가 부족해 보입니다. 다음 학습 시에는...',
    createdAt: '2026.01.15',
    useCount: 42,
  },
  {
    id: 't2',
    name: '국어 비문학 총평 (독해력 향상)',
    subject: '국어',
    content:
      '이번 지문은 [주제]에 관한 내용이었습니다. 핵심 개념인 [키워드]를 정확히 파악했는지가 중요했는데, 문단별 요지를...',
    createdAt: '2026.01.20',
    useCount: 38,
  },
  {
    id: 't3',
    name: '영어 독해 피드백 (어휘 중심)',
    subject: '영어',
    content:
      "Today's reading passage focused on [topic]. The main grammar points were [structures]. You showed good...",
    createdAt: '2026.01.18',
    useCount: 31,
  },
  {
    id: 't4',
    name: '수학 개념 정리 피드백',
    subject: '수학',
    content: '[개념명]에 대한 이해가 잘 드러났습니다. 다만 [세부개념] 부분에서 보완이 필요해 보입니다. 다음에는...',
    createdAt: '2026.01.22',
    useCount: 28,
  },
  {
    id: 't5',
    name: '국어 문학 감상 피드백',
    subject: '국어',
    content: '작품의 [주제]를 잘 파악했네요. 선지 분석 시 [기준]을 명확히 하는 연습을 추가로 해보면 좋겠습니다.',
    createdAt: '2026.01.25',
    useCount: 24,
  },
  {
    id: 't6',
    name: '영어 문법 오답 노트',
    subject: '영어',
    content: '이번 문법 문제에서 [구조]를 놓쳤네요. 유사한 패턴을 정리해서 복습해보세요.',
    createdAt: '2026.01.28',
    useCount: 19,
  },
  {
    id: 't7',
    name: '공통 격려 멘트',
    subject: '공통',
    content: '오늘도 꾸준히 학습한 모습이 인상적입니다. [강점]을 유지하면서 [보완점]에 집중해보세요.',
    createdAt: '2026.02.01',
    useCount: 15,
  },
];

function getStored(): FeedbackTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FeedbackTemplate[];
      return parsed.map((t) =>
        (t as { subject: string }).subject === '공동'
          ? { ...t, subject: '공통' as const }
          : t
      );
    }
  } catch {
    // ignore
  }
  return [...MOCK_TEMPLATES];
}

function setStored(templates: FeedbackTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getFeedbackTemplates(): FeedbackTemplate[] {
  return getStored();
}

export function getFeedbackTemplate(id: string): FeedbackTemplate | undefined {
  return getStored().find((t) => t.id === id);
}

/** 기본 템플릿 조회 (isDefault=true인 템플릿, 없으면 과목별 첫 번째) */
export function getDefaultFeedbackTemplate(
  subject?: string
): FeedbackTemplate | undefined {
  const list = getStored();
  const defaultT = list.find((t) => t.isDefault);
  if (defaultT) return defaultT;
  if (subject) {
    const bySubject = list.find((t) => t.subject === subject);
    if (bySubject) return bySubject;
  }
  return list.find((t) => t.subject === '공통') ?? list[0];
}

export function saveFeedbackTemplate(
  template: Omit<FeedbackTemplate, 'useCount'> & { useCount?: number; isDefault?: boolean }
): void {
  const list = getStored();
  const existing = list.findIndex((t) => t.id === template.id);
  const item: FeedbackTemplate = {
    ...template,
    useCount: template.useCount ?? 0,
    isDefault: template.isDefault ?? false,
  };
  if (item.isDefault) {
    list.forEach((t) => (t.isDefault = false));
  }
  if (existing >= 0) {
    list[existing] = item;
  } else {
    list.unshift(item);
  }
  setStored(list);
}

export function deleteFeedbackTemplate(id: string): void {
  setStored(getStored().filter((t) => t.id !== id));
}

export function deleteFeedbackTemplates(ids: string[]): void {
  const set = new Set(ids);
  setStored(getStored().filter((t) => !set.has(t.id)));
}

export function incrementUseCount(id: string): void {
  const list = getStored();
  const idx = list.findIndex((t) => t.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], useCount: list[idx].useCount + 1 };
    setStored(list);
  }
}

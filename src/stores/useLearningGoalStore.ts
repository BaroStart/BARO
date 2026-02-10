import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getMaterialsMeta, initializeSeolstudyMaterials } from '@/lib/materialStorage';

export interface LearningGoal {
  id: string;
  mentorId: string;
  name: string;
  subject?: string;
  description?: string;
  /** 약점 (쉼표로 구분 가능) */
  weakness?: string;
  materialIds: string[];
  columnTemplate?: string;
  createdAt: string;
}

const SEEDED_KEY_PREFIX = 'learning-goal-seeded:';

function getSeededKey(mentorId: string) {
  return `${SEEDED_KEY_PREFIX}${mentorId}`;
}

function isSeeded(mentorId: string) {
  try {
    return localStorage.getItem(getSeededKey(mentorId)) === '1';
  } catch {
    return false;
  }
}

function markSeeded(mentorId: string) {
  try {
    localStorage.setItem(getSeededKey(mentorId), '1');
  } catch {
    // ignore
  }
}

function seedGoalsForMentor(mentorId: string): LearningGoal[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: `seed-goal-${mentorId}-korean-nonfiction`,
      mentorId,
      name: '비문학 지문 구조 파악',
      subject: '국어',
      description: '핵심문장 찾기 → 단락 요약 → 근거 표시까지 루틴화합니다.',
      weakness: '지문 구조 파악, 핵심문장 선별',
      materialIds: ['mat1'],
      columnTemplate:
        '<h3>오늘의 목표: 비문학 지문 구조 파악</h3><ul><li>각 단락 1문장 요약</li><li>핵심 근거 문장 밑줄/표시</li><li>문제 5개 풀고 오답 3개만 정리</li></ul><p><strong>제출</strong>: 요약 캡처 + 오답 3개</p>',
      createdAt: today,
    },
    {
      id: `seed-goal-${mentorId}-korean-literature`,
      mentorId,
      name: '문학 감상 포인트 정리',
      subject: '국어',
      description: '작품별 핵심 정서/표현기법/서술자 관점을 체크리스트로 정리합니다.',
      weakness: '표현기법, 화자/서술자 관점',
      materialIds: ['mat2'],
      columnTemplate:
        '<h3>오늘의 목표: 문학 감상 포인트 정리</h3><ul><li>작품 핵심 정서 1줄</li><li>표현기법 3개 찾기</li><li>서술자/화자 관점 정리</li></ul><p><strong>제출</strong>: 체크리스트 완료 캡처</p>',
      createdAt: today,
    },
    {
      id: `seed-goal-${mentorId}-english-reading`,
      mentorId,
      name: '영어 독해 구조화',
      subject: '영어',
      description: '토픽 센텐스 → 전개 → 결론 흐름을 먼저 잡고 세부로 내려갑니다.',
      weakness: '토픽 센텐스, 단락 구조',
      materialIds: ['mat3', 'mat4'],
      columnTemplate:
        '<h3>오늘의 목표: 영어 독해 구조화</h3><ol><li>각 단락 첫 문장만 읽고 흐름 예측</li><li>전개/예시/반박 표시</li><li>문제 10개 + 오답 원인 분류</li></ol><p><strong>제출</strong>: 오답 원인(뜻/추론/문장구조) 1줄씩</p>',
      createdAt: today,
    },
    {
      id: `seed-goal-${mentorId}-english-vocab`,
      mentorId,
      name: '영단어 누적 복습',
      subject: '영어',
      description: 'D+1 / D+3 / D+7 반복으로 장기 기억을 유지합니다.',
      weakness: '어휘 유지, 철자/혼동',
      materialIds: ['mat5'],
      columnTemplate:
        '<h3>오늘의 목표: 영단어 누적 복습</h3><ul><li>D+1 10분</li><li>D+3 10분</li><li>D+7 10분</li><li>오답 5개만 남기기</li></ul><p><strong>제출</strong>: 각 세트 오답 개수(예: 3/2/1)</p>',
      createdAt: today,
    },
    {
      id: `seed-goal-${mentorId}-math-calculus`,
      mentorId,
      name: '미적분 개념 + 기본 문제',
      subject: '수학',
      description: '개념을 1페이지로 정리하고 기본 문제로 바로 확인합니다.',
      weakness: '개념 적용, 계산 실수',
      materialIds: ['mat6'],
      columnTemplate:
        '<h3>오늘의 목표: 미적분 개념 + 기본 문제</h3><ul><li>개념 1페이지 정리</li><li>예제 5개 풀이</li><li>오답 3개만 “왜 틀렸는지” 기록</li></ul><p><strong>제출</strong>: 개념정리 + 오답 3개</p>',
      createdAt: today,
    },
    {
      id: `seed-goal-${mentorId}-math-geometry`,
      mentorId,
      name: '기하 벡터 연산 숙달',
      subject: '수학',
      description: '벡터 기본 연산을 반복해서 속도/정확도를 올립니다.',
      weakness: '벡터 연산, 도형 해석',
      materialIds: ['mat7'],
      columnTemplate:
        '<h3>오늘의 목표: 기하 벡터 연산 숙달</h3><ul><li>기본 연산 10문항</li><li>응용 5문항</li><li>실수 유형(부호/좌표/도형) 체크</li></ul><p><strong>제출</strong>: 실수 유형 체크 + 오답 3개</p>',
      createdAt: today,
    },
  ];
}

interface LearningGoalStore {
  goals: LearningGoal[];

  addGoal: (goal: Omit<LearningGoal, 'id' | 'createdAt'>) => string;
  updateGoal: (id: string, data: Partial<LearningGoal>) => void;
  deleteGoal: (id: string) => void;

  getGoalsByMentor: (mentorId: string) => LearningGoal[];
  getGoalById: (id: string) => LearningGoal | undefined;

  initialize: (mentorId: string) => void;
}

export const useLearningGoalStore = create<LearningGoalStore>()(
  persist(
    (set, get) => ({
      goals: [],

      addGoal: (goal) => {
        const id = `goal-${Date.now()}`;
        const newGoal: LearningGoal = {
          ...goal,
          id,
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
        return id;
      },

      updateGoal: (id, data) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },

      getGoalsByMentor: (mentorId) => {
        return get().goals.filter((g) => g.mentorId === mentorId);
      },

      getGoalById: (id) => {
        return get().goals.find((g) => g.id === id);
      },

      initialize: (_mentorId) => {
        initializeSeolstudyMaterials();

        // 1) 기본 설스터디 학습자료가 있는 환경에서, 최초 1회만 기본 "과제 목표"를 채워둠
        const mentorId = _mentorId;
        if (!mentorId) return;

        const seeded = seedGoalsForMentor(mentorId);
        const seedMap = new Map(seeded.map((g) => [g.id, g]));

        const existingForMentor = get().goals.filter((g) => g.mentorId === mentorId);
        if (existingForMentor.length > 0) {
          // 기존 seed 목표에 subject 등 새 필드가 없으면 업데이트
          const needsUpdate = existingForMentor.some(
            (g) => seedMap.has(g.id) && !g.subject,
          );
          if (needsUpdate) {
            set((state) => ({
              goals: state.goals.map((g) => {
                const seed = seedMap.get(g.id);
                if (seed && !g.subject) {
                  return { ...g, subject: seed.subject, columnTemplate: seed.columnTemplate };
                }
                return g;
              }),
            }));
          }
          if (!isSeeded(mentorId)) markSeeded(mentorId);
          return;
        }

        if (isSeeded(mentorId)) return;

        // 혹시 저장소에 같은 id가 있으면 제외
        const existingIds = new Set(get().goals.map((g) => g.id));
        const toAdd = seeded.filter((g) => !existingIds.has(g.id));
        if (toAdd.length > 0) {
          set((state) => ({ goals: [...state.goals, ...toAdd] }));
        }
        markSeeded(mentorId);
      },
    }),
    {
      name: 'learning-goal-storage',
    },
  ),
);

export function getMaterialsByIds(ids: string[]) {
  return getMaterialsMeta().filter((m) => ids.includes(m.id));
}

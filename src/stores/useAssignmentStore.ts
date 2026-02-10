import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants';
import { queryClient } from '@/lib/queryClient';
import type { IncompleteAssignment, MenteeTask } from '@/types';

/**
 * 과제 등록 시 Mock 모드에서 메모리/로컬스토리지에 저장.
 * 백엔드 연동 시 API가 소스가 되며 이 store는 Mock 모드에서만 사용됨.
 */
interface AssignmentStoreState {
  /** 등록된 학습 일정 (캘린더/To-Do) */
  registeredTasks: MenteeTask[];
  /** 등록된 미완료 과제 */
  registeredIncomplete: IncompleteAssignment[];
  addTasks: (tasks: MenteeTask[]) => void;
  addIncomplete: (assignments: IncompleteAssignment[]) => void;
  /** 미완료 과제 삭제 - 등록한 과제만 제거 (더미는 항상 유지) */
  removeIncomplete: (id: string) => void;
  /** 등록한 과제 전체 초기화 (더미만 남김) */
  clearRegisteredIncomplete: (menteeId?: string) => void;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useAssignmentStore = create<AssignmentStoreState>()(
  persist(
    (set) => ({
      registeredTasks: [],
      registeredIncomplete: [],
      addTasks: (tasks) =>
        set((s) => ({
          registeredTasks: [...s.registeredTasks, ...tasks],
        })),
      addIncomplete: (assignments) =>
        set((s) => {
          const updated = s.registeredIncomplete.map((a) => {
            const replacement = assignments.find((na) => na.id === a.id);
            return replacement ?? a;
          });
          const newOnes = assignments.filter((a) => !s.registeredIncomplete.some((ea) => ea.id === a.id));
          return {
            registeredIncomplete: [...updated, ...newOnes],
          };
        }),
      removeIncomplete: (id) =>
        set((s) => {
          const inRegistered = s.registeredIncomplete.some((a) => a.id === id);
          if (inRegistered) {
            return {
              registeredIncomplete: s.registeredIncomplete.filter((a) => a.id !== id),
            };
          }
          return {}; // 더미는 삭제하지 않음 - 항상 유지
        }),
      clearRegisteredIncomplete: (menteeId) =>
        set((s) => ({
          registeredIncomplete: menteeId
            ? s.registeredIncomplete.filter((a) => a.menteeId !== menteeId)
            : [],
        })),
    }),
    {
      name: STORAGE_KEYS.ASSIGNMENTS,
      version: 2,
      partialize: (s) => ({
        registeredTasks: s.registeredTasks,
        registeredIncomplete: s.registeredIncomplete,
      }),
      migrate: (persistedState: unknown) => {
        const s = persistedState as Record<string, unknown> | null;
        if (!s || typeof s !== 'object') {
          return { registeredTasks: [], registeredIncomplete: [] };
        }
        return {
          registeredTasks: Array.isArray(s.registeredTasks) ? s.registeredTasks : [],
          registeredIncomplete: Array.isArray(s.registeredIncomplete) ? s.registeredIncomplete : [],
        };
      },
      onRehydrateStorage: () => () => {
        // 새로고침 후 persist 복원 시 미완료 과제 쿼리 갱신
        queryClient.invalidateQueries({ queryKey: ['incompleteAssignments'] });
      },
    }
  ),
);

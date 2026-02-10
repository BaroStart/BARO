import { create } from 'zustand';

interface AssignmentDetailUIState {
  /** 현재 과제 상세 페이지의 제출 완료 여부 */
  isSubmitted: boolean;
  setIsSubmitted: (v: boolean) => void;
  /** 삭제 콜백 (페이지에서 등록) */
  onDelete: (() => void) | null;
  setOnDelete: (fn: (() => void) | null) => void;
}

export const useAssignmentDetailUIStore = create<AssignmentDetailUIState>()((set) => ({
  isSubmitted: false,
  setIsSubmitted: (v) => set({ isSubmitted: v }),
  onDelete: null,
  setOnDelete: (fn) => set({ onDelete: fn }),
}));

import { create } from 'zustand';

import type { BadgeItem } from '@/components/mentee/my/BadgeSection';

type BadgeCelebrationState = {
  show: boolean;
  badge: BadgeItem | null;
  trigger: (badge: BadgeItem) => void;
  dismiss: () => void;
};

export const useBadgeCelebrationStore = create<BadgeCelebrationState>((set) => ({
  show: false,
  badge: null,
  trigger: (badge) => set({ show: true, badge }),
  dismiss: () => set({ show: false, badge: null }),
}));

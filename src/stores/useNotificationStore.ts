import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { fetchRecentNotifications, markNotificationRead } from '@/api/notifications';
import { STORAGE_KEYS } from '@/constants';

export type NotificationType = 'reminder' | 'feedback' | 'system';

export type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link?: string;
  /** 알림에 해당하는 날짜 (YYYY-MM-DD). 클릭 시 해당 날짜로 이동 */
  dateAt?: string;
};

type NotificationState = {
  notifications: NotificationItem[];
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  markAllRead: () => void;
  markRead: (id: number) => void;
  upsertMany: (items: NotificationItem[]) => void;
};

function computeUnreadCount(items: NotificationItem[]) {
  return items.reduce((sum, n) => sum + (n.isRead ? 0 : 1), 0);
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      loadNotifications: async () => {
        try {
          const items = await fetchRecentNotifications();
          set({ notifications: items, unreadCount: computeUnreadCount(items) });
        } catch {
          set({ notifications: [], unreadCount: 0 });
        }
      },
      markAllRead: () => {
        const unreadIds = get().notifications.filter((n) => !n.isRead).map((n) => n.id);
        const next = get().notifications.map((n) => ({ ...n, isRead: true }));
        set({ notifications: next, unreadCount: 0 });
        // 서버에도 읽음 처리
        for (const id of unreadIds) {
          markNotificationRead(id).catch(() => {});
        }
      },
      markRead: (id) => {
        const next = get().notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        set({ notifications: next, unreadCount: computeUnreadCount(next) });
        markNotificationRead(id).catch(() => {});
      },
      upsertMany: (items) => {
        const byId = new Map(get().notifications.map((n) => [n.id, n] as const));
        for (const item of items) {
          byId.set(item.id, item);
        }
        const next = Array.from(byId.values()).sort((a, b) => b.id - a.id);
        set({ notifications: next, unreadCount: computeUnreadCount(next) });
      },
    }),
    {
      name: STORAGE_KEYS.NOTIFICATIONS,
      partialize: (state) => ({ notifications: state.notifications }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.unreadCount = computeUnreadCount(state.notifications);
      },
    },
  ),
);

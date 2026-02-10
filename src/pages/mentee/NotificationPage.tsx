import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { CheckCheck } from 'lucide-react';

import { EmptyNotificationIcon } from '@/components/icons';
import { NotificationRow } from '@/components/mentee/NotificationRow';
import { useNotificationStore } from '@/stores/useNotificationStore';

export function NotificationPage() {
  const navigate = useNavigate();
  const { notifications, markAllRead, markRead, loadNotifications } = useNotificationStore();

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  return (
    <div className="flex flex-1 flex-col bg-slate-50/50 px-4 pt-4 pb-6">
      {unreadCount > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] text-slate-500">
            읽지 않은 알림 <span className="font-semibold text-sky-600">{unreadCount}건</span>
          </p>
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          >
            <CheckCheck className="h-3 w-3" />
            모두 읽음
          </button>
        </div>
      )}

      {notifications.length > 0 ? (
        <div className="space-y-1">
          {notifications.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onPress={() => {
                markRead(item.id);
                if (item.link) navigate(item.link);
              }}
            />
          ))}

          <p className="pt-5 text-center text-[11px] text-slate-300">최근 30일 알림만 보관됩니다</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
          <EmptyNotificationIcon className="mb-3 h-12 w-12 text-slate-200" />
          <p className="text-sm text-slate-400">아직 도착한 알림이 없어요</p>
        </div>
      )}
    </div>
  );
}

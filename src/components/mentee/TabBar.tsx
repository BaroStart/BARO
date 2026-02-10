import { NavLink } from 'react-router-dom';

import {
  AssignmentIcon,
  FeedbackIcon,
  HomeIcon,
  NotificationIcon,
  UserIcon,
} from '@/components/icons';
import { useNotificationStore } from '@/stores/useNotificationStore';

interface TabItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const tabs: TabItem[] = [
  { path: '/mentee', label: '홈', icon: <HomeIcon />, end: true },
  { path: '/mentee/assignments', label: '과제', icon: <AssignmentIcon /> },
  { path: '/mentee/feedback', label: '피드백', icon: <FeedbackIcon /> },
  { path: '/mentee/notifications', label: '알림', icon: <NotificationIcon /> },
  { path: '/mentee/mypage', label: 'MY', icon: <UserIcon /> },
];

export function TabBar() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-gray-100 bg-white sm:max-w-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 transition-colors ${
                isActive ? 'text-[hsl(var(--brand))]' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-6 items-center justify-center ${isActive ? 'text-[#0E9ABE]' : 'text-gray-400'}`}
                >
                  <span className="relative flex items-center justify-center">
                    {tab.icon}
                    {tab.path === '/mentee/notifications' && unreadCount > 0 && (
                      <span
                        className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500"
                        aria-label="읽지 않은 알림"
                      />
                    )}
                  </span>
                </span>
                <span
                  className={`text-xs font-medium ${isActive ? 'text-[hsl(var(--brand))]' : 'text-gray-400'}`}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

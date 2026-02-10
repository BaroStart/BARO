import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Bell, LogOut, Menu } from 'lucide-react';

import { logout as logoutApi } from '@/api/auth';
import { UserIcon } from '@/components/icons';
import { useAuthStore } from '@/stores/useAuthStore';
import { getDisplayName } from '@/types/auth';
import { useNotificationStore } from '@/stores/useNotificationStore';

interface HeaderProps {
  onMenuClick?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/mentor': '대시보드',
  '/mentor/assignments': '과제 관리',
  '/mentor/planner': '플래너 관리',
  '/mentor/feedback': '피드백 관리',
  '/mentor/templates': '템플릿',
};

export function Header({ onMenuClick }: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, markRead } = useNotificationStore();

  const getPageTitle = () => {
    if (location.pathname.includes('/assignments/new')) return '과제 등록';
    if (location.pathname.includes('/feedback/')) return '피드백 작성';
    if (location.pathname.startsWith('/mentor/mentees/')) return '멘티 관리';
    return PAGE_TITLES[location.pathname] ?? '대시보드';
  };
  const title = getPageTitle();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground/60 transition-all hover:bg-secondary hover:text-foreground md:hidden"
            aria-label="메뉴 열기"
          >
            <Menu size={20} />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-foreground sm:text-xl">
            {title}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* TODO: API 연결 — notifications를 실제 알림 API로 교체 */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationOpen((prev) => !prev);
                setProfileMenuOpen(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:text-foreground"
              aria-expanded={notificationOpen}
              aria-label="알림"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
              )}
            </button>
            {notificationOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotificationOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
                  <div className="border-b border-border px-4 py-3">
                    <h3 className="text-sm font-semibold text-foreground">알림</h3>
                    <p className="text-xs text-muted-foreground">
                      최근 알림 {notifications.length}개
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <Bell className="mx-auto h-8 w-8 text-muted-foreground/30" />
                        <p className="mt-2 text-sm text-muted-foreground">알림이 없습니다</p>
                      </div>
                    ) : (
                      notifications.map((n, index) => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className="border-b border-border/50 px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/50 cursor-pointer"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-foreground/10' : 'bg-rose-500'}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{n.title}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                {n.message}
                              </p>
                              <p className="mt-1.5 text-[10px] text-muted-foreground/70">
                                {n.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen((prev) => !prev);
                setNotificationOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-lg p-1.5 pr-3 transition-colors"
              aria-expanded={profileMenuOpen}
              aria-label="프로필 메뉴"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-secondary">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span className="hidden text-sm font-medium text-foreground sm:block">
                {getDisplayName(user)}
              </span>
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
                  <div className="px-3 py-2.5">
                    <p className="text-xs font-semibold text-foreground">{getDisplayName(user)}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user?.school ?? '소속 없음'}
                    </p>
                  </div>
                  <div className="border-t border-border p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/5"
                    >
                      <LogOut size={13} />
                      로그아웃
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

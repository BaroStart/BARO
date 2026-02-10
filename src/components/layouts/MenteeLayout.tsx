import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Trash2 } from 'lucide-react';

import { BadgeCelebrationOverlay } from '@/components/mentee/my/BadgeCelebrationOverlay';
import { TabBar } from '@/components/mentee/TabBar';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSSE } from '@/hooks/useSSE';
import { markAttendance } from '@/lib/menteeActivityStorage';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useAssignmentDetailUIStore } from '@/stores/useAssignmentDetailUIStore';
import { useAuthStore } from '@/stores/useAuthStore';

const PAGE_TITLES: Record<string, string> = {
  '/mentee/assignments': '과제',
  '/mentee/feedback': '피드백',
  '/mentee/notifications': '알림',
  '/mentee/mypage': '마이페이지',
};

function getPageTitle(pathname: string): string | undefined {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (/^\/mentee\/assignments\/[^/]+$/.test(pathname)) return '과제 상세';
  return undefined;
}

export function MenteeLayout() {
  useDocumentTitle('설스터디 | 멘티 페이지');
  useSSE();
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'mentee') void loadNotifications();
  }, [user?.role, loadNotifications]);

  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/mentee';
  const pageTitle = getPageTitle(pathname);
  const isAssignmentDetail = /^\/mentee\/assignments\/[^/]+$/.test(pathname);
  const isAssignmentSubmitted = useAssignmentDetailUIStore((s) => s.isSubmitted);
  const onDeleteAssignment = useAssignmentDetailUIStore((s) => s.onDelete);
  const showTabBar = !isAssignmentDetail;
  const showDeleteIcon = isAssignmentDetail && isAssignmentSubmitted;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user?.role !== 'mentee') return;
    markAttendance(user.id);
  }, [user?.id, user?.role]);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md sm:max-w-lg">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(165deg, #f8fafc 0%, #ffffff 35%, #f0f9ff 70%, #e0f2fe 100%)',
        }}
      />
      <div
        className="pointer-events-none fixed -right-[20%] -top-[20%] -z-10 h-[60%] w-[60%] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(193 70% 85%) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none fixed -bottom-[15%] -left-[15%] -z-10 h-[50%] w-[50%] rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(193 60% 90%) 0%, transparent 70%)' }}
      />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-white/70 backdrop-blur-xl">
        <div className="relative flex h-12 items-center justify-between px-4">
          {isHome ? (
            <NavLink to="/mentee" className="flex items-center gap-1">
              <img
                src="/logo.svg"
                alt="SeolStudy"
                className="h-6 w-6 shrink-0 rounded-lg object-contain"
              />
              <span className="font-plus-jakarta text-base font-bold tracking-tight text-foreground">
                SeolStudy
              </span>
            </NavLink>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center text-foreground"
                aria-label="뒤로가기"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-foreground">
                {pageTitle ?? ''}
              </h1>
              {showDeleteIcon ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-red-400"
                  aria-label="삭제"
                >
                  <Trash2 className="h-[18px] w-[18px]" />
                </button>
              ) : (
                <div className="w-8 shrink-0" />
              )}
            </>
          )}
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-3rem)] flex-col bg-white">
        <Outlet />
        {showTabBar && <div className="shrink-0 h-14" />}
      </main>

      {showTabBar && <TabBar />}
      <BadgeCelebrationOverlay />

      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="max-w-sm"
      >
        <DialogHeader>
          <h3 className="text-sm font-semibold text-slate-900">과제를 삭제할까요?</h3>
        </DialogHeader>
        <DialogBody className="pt-0">
          <p className="text-xs text-slate-500">
            제출한 과제가 삭제되며, 이 작업은 되돌릴 수 없습니다.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={() => setShowDeleteConfirm(false)}
            className="h-8 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            취소
          </Button>
          <Button
            onClick={() => {
              setShowDeleteConfirm(false);
              onDeleteAssignment?.();
            }}
            className="h-8 px-3 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            삭제하기
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

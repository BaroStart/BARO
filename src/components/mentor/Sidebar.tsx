import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

import { AssignmentIcon, FeedbackIcon, HomeIcon, PlannerIcon, UserIcon } from '@/components/icons';
import { useMentees } from '@/hooks/useMentees';
import { getGradeLabel } from '@/lib/gradeLabels';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const quickMenu: MenuItem[] = [
  {
    label: '대시보드',
    path: '/mentor',
    icon: <HomeIcon className="h-[18px] w-[18px]" />,
    end: true,
  },
  {
    label: '과제 관리',
    path: '/mentor/assignments',
    icon: <AssignmentIcon className="h-[18px] w-[18px]" />,
  },
  {
    label: '피드백 관리',
    path: '/mentor/feedback',
    icon: <FeedbackIcon className="h-[18px] w-[18px]" />,
  },
  {
    label: '플래너 관리',
    path: '/mentor/planner',
    icon: <PlannerIcon className="h-[18px] w-[18px]" />,
  },
] as (MenuItem & { end?: boolean })[];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useMentees();
  const mentees = data?.mentees ?? [];
  const totalInfo = data?.totalInfo;
  const weeklyTotalAssignmentCount = data?.weeklyTotalAssignmentCount ?? 0;
  const isDashboard = location.pathname === '/mentor';

  const weeklyProgressPercent =
    weeklyTotalAssignmentCount > 0 && totalInfo?.weeklyCompleteAssignmentCount != null
      ? Math.round((totalInfo.weeklyCompleteAssignmentCount / weeklyTotalAssignmentCount) * 100)
      : 0;
  const todayCompleted = totalInfo?.todayTotalCompletedAssignmentCount ?? 0;
  const todayTotal = totalInfo?.todayTotalAssignmentCount ?? 0;
  const waitFeedbackCount = totalInfo?.totalWaitFeedbackCount ?? 0;
  const pathMenteeId = location.pathname.match(/\/mentor\/mentees\/([^/]+)/)?.[1];
  const selectedMenteeId = isDashboard ? null : (pathMenteeId ?? null);

  // 매일 오전 11시 피드백 마감 타이머
  const [deadlineNow, setDeadlineNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setDeadlineNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const deadline = useMemo(() => {
    const now = new Date(deadlineNow);
    const d = new Date(now);
    d.setHours(11, 0, 0, 0); // 오전 11시
    if (now.getTime() >= d.getTime()) {
      d.setDate(d.getDate() + 1); // 지나면 다음날 11시
    }
    return d.getTime();
  }, [deadlineNow]);

  const timeLeftMs = Math.max(0, deadline - deadlineNow);
  const timeLeftText = useMemo(() => {
    const totalSeconds = Math.floor(timeLeftMs / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }, [timeLeftMs]);

  const handleMenteeClick = (menteeId: string) => {
    navigate(`/mentor/mentees/${menteeId}`);
    onMobileClose?.();
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-20 flex h-screen w-56 flex-col bg-white/90 backdrop-blur-xl transition-all duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${collapsed ? 'md:w-[72px]' : ''}`}
      style={{
        borderRight: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className={`flex h-16 items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        <button
          type="button"
          onClick={() => {
            navigate('/mentor', { replace: true });
            onMobileClose?.();
          }}
          className="flex flex-1 items-center gap-2.5 overflow-hidden transition-all hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-brand/30"
          aria-label="메인으로 이동"
        >
          <img
            src="/logo.svg"
            alt="SeolStudy"
            className="h-9 w-9 shrink-0 rounded-lg object-contain"
          />
          {!collapsed && (
            <span className="font-plus-jakarta whitespace-nowrap text-lg font-bold tracking-tight text-foreground">
              SeolStudy
            </span>
          )}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-1">
            <button
              onClick={onToggle}
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-foreground md:flex"
              title="접기"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onMobileClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-foreground md:hidden"
              aria-label="메뉴 닫기"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {!collapsed ? (
        <>
          <div className="flex-1 overflow-y-auto px-3">
            <div className="mb-6">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                메인 메뉴
              </p>
              <div className="space-y-1">
                {quickMenu.map((item) => {
                  const isEnd = (item as MenuItem & { end?: boolean }).end;
                  const customActive = isEnd
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onMobileClose?.()}
                      className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors ${
                        customActive
                          ? 'bg-sky-50 text-sky-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className={customActive ? 'text-sky-600' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  담당 멘티
                </p>
                <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand">
                  {mentees.length}
                </span>
              </div>

              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="멘티 검색..."
                    className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                {mentees.map((mentee, index) => (
                  <button
                    key={mentee.id}
                    onClick={() => handleMenteeClick(mentee.id)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                      selectedMenteeId === mentee.id
                        ? 'bg-sky-50 text-sky-700'
                        : 'hover:bg-secondary'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                        selectedMenteeId === mentee.id ? 'bg-sky-100' : 'bg-secondary'
                      }`}
                    >
                      <UserIcon
                        className={`h-4 w-4 ${
                          selectedMenteeId === mentee.id ? 'text-sky-600' : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                    <div className="flex flex-1 flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium truncate ${
                            selectedMenteeId === mentee.id ? 'text-sky-700' : 'text-foreground'
                          }`}
                        >
                          {mentee.name}
                        </span>
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            selectedMenteeId === mentee.id ? 'bg-green-400' : 'bg-green-500'
                          }`}
                          title="활동 중"
                        />
                      </div>
                      <span
                        className={`text-xs truncate ${
                          selectedMenteeId === mentee.id ? 'text-sky-600/70' : 'text-muted-foreground'
                        }`}
                      >
                        {getGradeLabel(mentee.grade) || mentee.grade} · {mentee.track}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between rounded-md border border-slate-200 bg-white px-2.5 py-2">
                <span className="text-[11px] font-medium text-slate-600">피드백 마감까지</span>
                <span className="font-mono text-xs font-semibold text-slate-900">
                  {timeLeftText}
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">이번 주 진행률</span>
                <span className="text-sm font-bold text-slate-900">{weeklyProgressPercent}%</span>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-700"
                  style={{ width: `${Math.min(100, weeklyProgressPercent)}%` }}
                />
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>대기 피드백</span>
                  <span className="font-medium text-slate-700">{waitFeedbackCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span>확인한 과제</span>
                  <span className="font-medium text-slate-700">
                    {todayTotal > 0 ? `${todayCompleted}/${todayTotal}` : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 접힌 상태 */
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-2">
            {quickMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={(item as MenuItem & { end?: boolean }).end}
                className={({ isActive }) =>
                  `flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`
                }
                title={item.label}
              >
                {item.icon}
              </NavLink>
            ))}
          </div>

          <div className="my-4 h-px bg-border" />

          <div className="space-y-2">
            {mentees.map((mentee) => (
              <button
                key={mentee.id}
                onClick={() => handleMenteeClick(mentee.id)}
                className={`flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 ${
                  selectedMenteeId === mentee.id
                    ? 'bg-sky-50 text-sky-600'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
                title={`${mentee.name} (${getGradeLabel(mentee.grade) || mentee.grade} · ${mentee.track})`}
              >
                <UserIcon className="h-5 w-5" />
              </button>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={onToggle}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              title="펼치기"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </nav>
      )}
    </aside>
  );
}

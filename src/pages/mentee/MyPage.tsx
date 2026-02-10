import { useEffect, useMemo, useState } from 'react';

import { BadgeDetailSheet } from '@/components/mentee/my/BadgeDetailSheet';
import { BadgeSection } from '@/components/mentee/my/BadgeSection';
import { MonthlyStudyCalendar } from '@/components/mentee/my/MonthlyStudyCalendar';
import { SubjectAchievementSection } from '@/components/mentee/my/SubjectAchievementSection';
import { MOCK_SUBJECT_STUDY_TIMES } from '@/data/learningAnalysisMock';
import { MOCK_INCOMPLETE_ASSIGNMENTS } from '@/data/menteeDetailMock';
import {
  getLastSeenBadgeIds,
  setLastSeenBadgeIds,
} from '@/lib/badgeCelebrationStorage';
import { getLocalProfileImage } from '@/lib/profileImageStorage';
import { getAttendanceDates, getQnaCount, toYmdLocal } from '@/lib/menteeActivityStorage';
import { getSubmittedAssignments } from '@/lib/menteeAssignmentSubmissionStorage';
import { useBadgeCelebrationStore } from '@/stores/useBadgeCelebrationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTodoStore } from '@/stores/useTodoStore';
import { getDisplayName } from '@/types/auth';

export function MyPage() {
  const { user: authUser, logout } = useAuthStore();
  const [badgeDetail, setBadgeDetail] = useState<{ open: boolean; badge: Parameters<typeof BadgeDetailSheet>[0]['badge'] }>({
    open: false,
    badge: null,
  });

  const dailyQuote = useMemo(() => {
    // "매일 바뀌는 멘트" (로컬 날짜 기준, 하루 동안은 고정)
    const quotes = [
      '노력은 배신하지 않는다\n오늘도 한 걸음 더 나아가는 당신을 응원합니다!',
      '완벽보다 꾸준함이 더 강합니다.\n오늘도 해냈어요.',
      '작은 습관이 큰 변화를 만듭니다.\n지금의 한 페이지를 쌓아가요.',
      '어제보다 1%만 더.\n그게 결국 가장 큰 차이입니다.',
      '멈추지 않으면 결국 도착합니다.\n오늘도 천천히, 하지만 확실하게.',
      '실수는 성장의 증거.\n오늘 배운 걸 내일의 나에게 선물하세요.',
      '지금의 집중이 미래를 바꿉니다.\n응원할게요!',
    ] as const;

    const now = new Date();
    // local date seed (YYYYMMDD) → stable per day
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    return quotes[seed % quotes.length];
  }, []);

  const summary = useMemo(
    () => ({
      weekProgressPercent: 80,
      totalStudyText: '24시간 30분',
      completedText: '44/55',
      quote: dailyQuote,
    }),
    [dailyQuote],
  );

  const subjects = useMemo(
    () => [
      { id: 'kor', name: '국어', percent: 92, progressText: '44 / 55' },
      { id: 'eng', name: '영어', percent: 78, progressText: '31 / 40' },
      { id: 'math', name: '수학', percent: 65, progressText: '26 / 40' },
    ],
    [],
  );

  const { todosByDate } = useTodoStore();

  const badges = useMemo(() => {
    const userKey = (authUser?.id ?? '').trim();
    // mock 데이터는 s1/s2 기반이라, 실 API 로그인(아이디=loginId)인 경우도 s1로 폴백
    const mockMenteeId =
      authUser?.role === 'mentee' && authUser?.id && /^s\d+$/i.test(authUser.id)
        ? authUser.id
        : 's1';

    const todayKey = toYmdLocal(new Date());

    const attendanceDates = userKey ? getAttendanceDates(userKey) : [];
    const attendanceSet = new Set(attendanceDates);

    const consecutiveEndingToday = (set: Set<string>, untilKey: string) => {
      const [y, m, d] = untilKey.split('-').map(Number);
      if (!y || !m || !d) return 0;
      const cur = new Date(y, m - 1, d);
      let streak = 0;
      while (true) {
        const k = toYmdLocal(cur);
        if (!set.has(k)) break;
        streak += 1;
        cur.setDate(cur.getDate() - 1);
      }
      return streak;
    };

    const attendanceStreak = consecutiveEndingToday(attendanceSet, todayKey);

    const submitted = userKey ? getSubmittedAssignments(userKey) : {};
    const submittedIds = new Set(Object.keys(submitted));

    const isAssignmentDoneForUser = (assignmentId: string, baseStatus?: string) =>
      baseStatus === 'completed' || submittedIds.has(assignmentId);

    // "첫 과제 완료": 진짜로 제출을 한 번이라도 했을 때만 오픈
    const firstAssignmentDone = submittedIds.size >= 1;

    // 주간목표 달성: 최근 7일 연속으로 (해당 날짜의 과제 달성률 100%)
    const assignments = MOCK_INCOMPLETE_ASSIGNMENTS.filter((a) => a.menteeId === mockMenteeId);
    const assignmentStatsByDate = new Map<string, { total: number; done: number }>();
    for (const a of assignments) {
      const dateKey = a.deadlineDate ?? a.completedAtDate;
      if (!dateKey) continue;
      const cur = assignmentStatsByDate.get(dateKey) ?? { total: 0, done: 0 };
      cur.total += 1;
      if (isAssignmentDoneForUser(a.id, a.status)) cur.done += 1;
      assignmentStatsByDate.set(dateKey, cur);
    }

    const dayHasAllAssignmentsDone = (dateKey: string) => {
      const s = assignmentStatsByDate.get(dateKey);
      return !!s && s.total > 0 && s.done === s.total;
    };

    const streakDays = (untilKey: string, days: number, predicate: (k: string) => boolean) => {
      const [y, m, d] = untilKey.split('-').map(Number);
      if (!y || !m || !d) return false;
      const cur = new Date(y, m - 1, d);
      for (let i = 0; i < days; i += 1) {
        const k = toYmdLocal(cur);
        if (!predicate(k)) return false;
        cur.setDate(cur.getDate() - 1);
      }
      return true;
    };

    const weeklyGoalAchieved = streakDays(todayKey, 7, dayHasAllAssignmentsDone);

    // 오늘도 한 걸음: 최근 7일 연속으로 (해당 날짜 할 일 100% 완료)
    const todoHasAllDone = (dateKey: string) => {
      const list = todosByDate[dateKey] ?? [];
      if (list.length === 0) return false;
      return list.every((t) => t.done);
    };
    const todoStreakAchieved = streakDays(todayKey, 7, todoHasAllDone);

    // 질문왕: 코멘트/질문 제출 10회 이상
    const qnaCount = userKey ? getQnaCount(userKey) : 0;
    const questionKing = qnaCount >= 10;

    // 학습시간(목데이터 기반): 과목별 50h, 누적 100h
    const subjectHours = MOCK_SUBJECT_STUDY_TIMES[mockMenteeId] ?? [];
    const hoursOf = (subject: string) =>
      subjectHours.find((s) => s.subject === subject)?.hours ?? 0;
    const korMaster = hoursOf('국어') >= 50;
    const engMaster = hoursOf('영어') >= 50;
    const mathMaster = hoursOf('수학') >= 50;
    const total100h = subjectHours.reduce((acc, s) => acc + (s.hours ?? 0), 0) >= 100;

    // 포모도로: 25분 이상 집중 timeList가 붙은 완료 todo 20회 이상
    const pomodoroCount = (() => {
      let count = 0;
      for (const list of Object.values(todosByDate)) {
        for (const t of list) {
          if (!t.done || !t.timeList?.length) continue;
          const slot = t.timeList[0];
          const start = new Date(slot.startTime).getTime();
          const end = new Date(slot.endTime).getTime();
          if (Number.isFinite(start) && Number.isFinite(end) && end - start >= 25 * 60 * 1000) {
            count += 1;
          }
        }
      }
      return count;
    })();
    const pomodoroMaster = pomodoroCount >= 20;

    // 아침 루틴: 6~9시 사이에 체크한(완료한) todo/과제 7회 이상
    const morningCount = (() => {
      let count = 0;

      // todo (timeList 기준)
      for (const list of Object.values(todosByDate)) {
        for (const t of list) {
          if (!t.done || !t.timeList?.length) continue;
          const slot = t.timeList[0];
          const d = new Date(slot.startTime);
          const h = d.getHours();
          if (h >= 6 && h <= 9) count += 1;
        }
      }

      // assignments (submittedAt 기준)
      for (const meta of Object.values(submitted)) {
        const d = new Date(meta.submittedAt);
        const h = d.getHours();
        if (h >= 6 && h <= 9) count += 1;
      }

      return count;
    })();
    const morningRoutine = morningCount >= 7;

    return [
      {
        id: 'badge_first_assignment',
        title: '첫 과제',
        subtitle: '완료',
        acquired: firstAssignmentDone,
      },
      {
        id: 'badge_attendance_7',
        title: '7일 연속',
        subtitle: '출석',
        acquired: attendanceStreak >= 7,
      },
      {
        id: 'badge_attendance_30',
        title: '30일 연속',
        subtitle: '출석',
        acquired: attendanceStreak >= 30,
      },
      {
        id: 'badge_weekly_goal_7days',
        title: '주간목표',
        subtitle: '달성',
        acquired: weeklyGoalAchieved,
      },
      {
        id: 'badge_todo_streak_7',
        title: '오늘도',
        subtitle: '한 걸음',
        acquired: todoStreakAchieved,
      },
      { id: 'badge_question_king', title: '질문왕', subtitle: '10회+', acquired: questionKing },
      { id: 'badge_korean_master', title: '국어', subtitle: '마스터', acquired: korMaster },
      { id: 'badge_math_master', title: '수학', subtitle: '마스터', acquired: mathMaster },
      { id: 'badge_english_master', title: '영어', subtitle: '마스터', acquired: engMaster },
      { id: 'badge_total_100h', title: '100시간', subtitle: '학습', acquired: total100h },
      {
        id: 'badge_pomodoro_master',
        title: '포모도로',
        subtitle: '마스터',
        acquired: pomodoroMaster,
      },
      { id: 'badge_morning_routine', title: '아침', subtitle: '루틴', acquired: morningRoutine },
    ];
  }, [authUser?.id, authUser?.role, todosByDate]);

  const triggerBadgeCelebration = useBadgeCelebrationStore((s) => s.trigger);

  useEffect(() => {
    const userKey = (authUser?.id ?? '').trim();
    if (!userKey) return;
    const acquired = badges.filter((b) => b.acquired).map((b) => b.id);
    const lastSeen = getLastSeenBadgeIds(userKey);
    const lastSeenSet = new Set(lastSeen);
    const newIds = acquired.filter((id) => !lastSeenSet.has(id));
    if (newIds.length > 0) {
      const firstNew = badges.find((b) => b.id === newIds[0]);
      if (firstNew) triggerBadgeCelebration(firstNew);
    }
    setLastSeenBadgeIds(userKey, acquired);
  }, [authUser?.id, badges, triggerBadgeCelebration]);

  return (
    <div className="relative px-4 pt-4 pb-4">
      {/* 1. 상단: 핵심 정체성 (인스타 프로필처럼) */}
      <section className="mb-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 h-20 w-20 shrink-0 overflow-hidden rounded-full bg-white border border-slate-100">
            {(getLocalProfileImage() || authUser?.profileImage) ? (
              <img src={getLocalProfileImage() || authUser?.profileImage || ''} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" />
                </svg>
              </div>
            )}
          </div>
          <h1 className="text-lg font-bold text-slate-900">{getDisplayName(authUser)}님</h1>
          <div className="mt-3 w-full max-w-[200px]">
            <div className="flex justify-between text-xs text-slate-500">
              <span>이번 주</span>
              <span>{summary.weekProgressPercent}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[hsl(var(--brand))] transition-all duration-500"
                style={{ width: `${summary.weekProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. 중단: 요약 정보 */}
      <section className="mb-6 flex justify-center gap-12 border-y border-slate-100 py-4">
        <div className="flex flex-col items-center">
          <span className="text-base font-bold text-slate-900">{summary.totalStudyText}</span>
          <span className="text-xs text-slate-500">학습시간</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-base font-bold text-slate-900">{summary.completedText}</span>
          <span className="text-xs text-slate-500">완료</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-base font-bold text-slate-900">{badges.filter((b) => b.acquired).length}</span>
          <span className="text-xs text-slate-500">배지</span>
        </div>
      </section>

      {/* 3. 오늘의 문구 */}
      <section className="space-y-4">
        <div className="rounded-xl bg-white border border-slate-100 px-4 py-4">
          <p className="whitespace-pre-line text-center text-sm font-medium leading-6 text-slate-700">
            {summary.quote}
          </p>
        </div>
      </section>

      {/* 4. 과목별 달성률 */}
      <section className="mt-6">
        <SubjectAchievementSection title="과목별 달성률" items={subjects} />
      </section>

      <section className="mt-6">
        <MonthlyStudyCalendar />
      </section>

      <section className="mt-6">
        <BadgeSection
          title="획득한 배지"
          items={badges}
          onBadgeClick={(b) => setBadgeDetail({ open: true, badge: b })}
        />
      </section>

      <BadgeDetailSheet
        open={badgeDetail.open}
        badge={badgeDetail.badge}
        onClose={() => setBadgeDetail((prev) => ({ ...prev, open: false }))}
      />

      {/* 로그아웃 */}
      <section className="mt-8 mb-4">
        <button
          type="button"
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="w-full rounded-lg border border-slate-100 bg-white py-3 text-[13px] font-medium text-slate-400 transition hover:bg-slate-50"
        >
          로그아웃
        </button>
      </section>
    </div>
  );
}

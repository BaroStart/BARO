import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  ArrowRight,
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  Clock,
  FileText,
  MoreVertical,
  PenLine,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { UserIcon } from '@/components/icons';
import { FeedbackWriteModal } from '@/components/mentor/FeedbackWriteModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { toast } from '@/components/ui/Toast';
import { useMentees } from '@/hooks/useMentees';
import { useSubmittedAssignments } from '@/hooks/useSubmittedAssignments';
import { getDeadlineStatus } from '@/lib/feedbackDeadline';
import { useAuthStore } from '@/stores/useAuthStore';
import { getWelcomeTitle } from '@/types/auth';
import type { MenteeSummary, SubmittedAssignment } from '@/types';

const FILTER_TABS = [
  { id: 'all', label: '전체' },
  { id: 'pending', label: '과제 대기' },
  { id: 'feedback', label: '피드백 필요' },
] as const;

export function MentorMainPage() {
  const { user } = useAuthStore();
  const [filterTab, setFilterTab] = useState<(typeof FILTER_TABS)[number]['id']>('all');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModalInitial, setFeedbackModalInitial] = useState<{
    menteeId?: string;
    assignmentId?: string;
  }>({});
  const [deletedMenteeIds, setDeletedMenteeIds] = useState<Set<string>>(new Set());

  const openFeedbackModal = (menteeId?: string, assignmentId?: string) => {
    setFeedbackModalInitial({ menteeId, assignmentId });
    setFeedbackModalOpen(true);
  };

  const { data: menteesData } = useMentees();
  const mentees = menteesData?.mentees ?? [];
  const totalInfo = menteesData?.totalInfo;
  const { data: submittedAssignments = [] } = useSubmittedAssignments();

  const totalPendingFeedback = mentees.reduce((sum, m) => sum + m.pendingFeedbackCount, 0);
  const overdueCount = submittedAssignments.filter(
    (a) => !a.feedbackDone && getDeadlineStatus(a.submittedAt) === 'overdue',
  ).length;
  const totalAssignments = mentees.reduce((sum, m) => sum + m.todayTotal, 0);
  const completedAssignments = mentees.reduce((sum, m) => sum + m.todaySubmitted, 0);
  const weeklyCompleted = totalInfo?.weeklyCompleteAssignmentCount ?? 0;

  const filteredMentees = mentees
    .filter((m) => !deletedMenteeIds.has(m.id))
    .filter((mentee) => {
      if (filterTab === 'all') return true;
      if (filterTab === 'pending') return mentee.todaySubmitted < mentee.todayTotal;
      if (filterTab === 'feedback') return mentee.pendingFeedbackCount > 0;
      return true;
    });

  // TODO: API 연결 — 현재 클라이언트 Set 기반 삭제 (새로고침 시 복원됨), 서버 API로 교체 필요
  const handleDeleteMentee = (menteeId: string, menteeName: string) => {
    if (
      window.confirm(`"${menteeName}" 멘티를 삭제하시겠습니까?\n삭제된 멘티는 목록에서 제거됩니다.`)
    ) {
      setDeletedMenteeIds((prev) => new Set(prev).add(menteeId));
      toast.success('멘티가 삭제되었습니다.');
    }
  };

  return (
    <div className="min-w-0 space-y-5">
      <section
        className="relative overflow-hidden rounded-xl border border-border/50 p-6"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 50%, #f0f7fc 100%)',
        }}
      >
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {getWelcomeTitle(user)}, 안녕하세요!
            </h2>
            <p className="mt-1.5 text-sm text-foreground/60">
              오늘 <span className="font-bold text-brand">{totalPendingFeedback}개</span>의 피드백이
              기다리고 있어요
            </p>
          </div>

          <div className="flex shrink-0 gap-2.5">
            <Link
              to={
                mentees.length > 0
                  ? `/mentor/mentees/${mentees[0].id}/assignments/new`
                  : '/mentor'
              }
              className="flex h-8 items-center gap-1.5 rounded-md border border-foreground/15 bg-white px-4 text-xs font-semibold text-foreground shadow-sm transition-all hover:border-foreground/30 hover:shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />새 과제
            </Link>
            <Button
              variant="brand-soft"
              size="sm"
              className="gap-1.5 shadow-sm"
              onClick={() => openFeedbackModal()}
            >
              <PenLine className="h-3 w-3" />
              피드백 작성
            </Button>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-border/60 bg-white px-3 py-3 text-center">
            <p className="text-lg font-bold text-foreground">
              {mentees.length}
              <span className="ml-0.5 text-xs font-normal text-foreground/50">명</span>
            </p>
            <p className="mt-0.5 text-[11px] text-foreground/60">담당 멘티</p>
          </div>
          <Link
            to="/mentor/feedback"
            className="rounded-lg border border-brand/20 bg-brand/5 px-3 py-3 text-center transition-colors hover:bg-brand/10"
          >
            <p className="text-lg font-bold text-brand">
              {totalPendingFeedback}
              <span className="ml-0.5 text-xs font-normal">개</span>
            </p>
            <p className="mt-0.5 text-[11px] text-foreground/60">
              대기 피드백
              {overdueCount > 0 && (
                <span className="ml-1 inline-flex rounded bg-red-100 px-1 py-px text-[9px] font-semibold text-red-600">
                  {overdueCount} 마감 초과
                </span>
              )}
            </p>
          </Link>
          <div className="rounded-lg border border-border/60 bg-white px-3 py-3 text-center">
            <p className="text-lg font-bold text-foreground">
              {completedAssignments}
              <span className="text-xs font-normal text-foreground/50">/{totalAssignments}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-foreground/60">오늘의 과제</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-white px-3 py-3 text-center">
            <p className="text-lg font-bold text-foreground">
              {weeklyCompleted}
              <span className="ml-0.5 text-xs font-normal text-foreground/50">개</span>
            </p>
            <p className="mt-0.5 text-[11px] text-foreground/60">주간 완료</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-bold text-foreground">담당 멘티 현황</h3>
          <FilterTabs
            items={FILTER_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
            value={filterTab}
            onChange={setFilterTab}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredMentees.map((mentee, index) => (
            <MenteeCard
              key={mentee.id}
              mentee={mentee}
              recentAssignments={submittedAssignments.filter((a) => a.menteeId === mentee.id)}
              onDelete={() => handleDeleteMentee(mentee.id, mentee.name)}
              onFeedbackClick={(assignmentId) => openFeedbackModal(mentee.id, assignmentId)}
              index={index}
            />
          ))}
        </div>

        {filteredMentees.length === 0 && (
          <EmptyState
            icon={<UserIcon className="h-6 w-6" />}
            title="해당하는 멘티가 없습니다"
            description="등록된 멘티가 없거나, 서버 오류로 목록을 불러오지 못했을 수 있습니다. 새로고침 해 보세요."
          />
        )}
      </section>

      <FeedbackWriteModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        initialMenteeId={feedbackModalInitial.menteeId}
        initialAssignmentId={feedbackModalInitial.assignmentId}
      />
    </div>
  );
}

function RecentAssignmentItem({
  assignment,
  onFeedbackClick,
}: {
  assignment: SubmittedAssignment;
  onFeedbackClick: () => void;
}) {
  const Icon =
    assignment.iconType === 'camera'
      ? Camera
      : assignment.iconType === 'book'
        ? BookOpen
        : FileText;

  return (
    <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-white p-2.5 transition-colors hover:bg-secondary/50">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-secondary text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">{assignment.title}</p>
          <p className="text-[11px] text-muted-foreground">{assignment.submittedAt}</p>
        </div>
      </div>
      {assignment.feedbackDone ? (
        <Button variant="success-soft" size="xs" className="shrink-0 gap-1 pointer-events-none">
          <Check className="h-3 w-3" />
          피드백 완료
        </Button>
      ) : getDeadlineStatus(assignment.submittedAt) === 'overdue' ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded bg-red-100 px-1 py-px text-[9px] font-semibold text-red-600">
            마감 초과
          </span>
          <Button variant="brand-soft" size="xs" onClick={onFeedbackClick}>
            피드백 작성하기
          </Button>
        </div>
      ) : (
        <Button variant="brand-soft" size="xs" className="shrink-0" onClick={onFeedbackClick}>
          피드백 작성하기
        </Button>
      )}
    </div>
  );
}

function MenteeCard({
  mentee,
  recentAssignments,
  onDelete,
  onFeedbackClick,
  index,
}: {
  mentee: MenteeSummary;
  recentAssignments: SubmittedAssignment[];
  onDelete: () => void;
  onFeedbackClick: (assignmentId: string) => void;
  index: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const todayProgress =
    mentee.todayTotal > 0 ? (mentee.todaySubmitted / mentee.todayTotal) * 100 : 0;

  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-white p-5 transition-all hover:shadow-soft"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="mb-4 flex items-start justify-between">
        <Link to={`/mentor/mentees/${mentee.id}`} className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{mentee.name}</span>
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground/70">
                {mentee.gradeFull ?? mentee.grade}
              </span>
            </div>
            <p className="text-xs text-foreground/70">
              {mentee.school}
              {mentee.desiredMajor && (
                <span className="ml-1">· 희망 전공: {mentee.desiredMajor}</span>
              )}
            </p>
            <div className="flex items-center gap-2.5 text-[11px] text-foreground/50">
              {mentee.mentoringStart && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {mentee.mentoringStart}
                </span>
              )}
              {mentee.lastActive && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {mentee.lastActive}
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-md border border-border bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  멘티 삭제
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-foreground/60">오늘 진행률</span>
          <span className="text-xs font-bold text-foreground">
            {mentee.todaySubmitted}/{mentee.todayTotal}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-brand transition-all duration-500"
            style={{ width: `${todayProgress}%` }}
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-secondary/70 px-2 py-2.5 text-center">
          <p className="text-sm font-bold text-foreground">{mentee.weeklyAchievement ?? 0}%</p>
          <p className="mt-0.5 text-[10px] text-foreground/50">주간 달성</p>
        </div>
        <div className="rounded-lg bg-secondary/70 px-2 py-2.5 text-center">
          <p className="text-sm font-bold text-foreground">{mentee.learningCert ?? '-'}</p>
          <p className="mt-0.5 text-[10px] text-foreground/50">학습 인증</p>
        </div>
        <div className="rounded-lg bg-secondary/70 px-2 py-2.5 text-center">
          <p className="text-sm font-bold text-foreground">{mentee.pendingFeedbackCount}</p>
          <p className="mt-0.5 text-[10px] text-foreground/50">대기 피드백</p>
        </div>
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <h4 className="text-xs font-bold text-foreground">최근 제출</h4>
          <Link
            to={`/mentor/mentees/${mentee.id}`}
            className="flex items-center gap-0.5 text-[11px] font-medium text-brand hover:underline"
          >
            전체 보기
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-1.5">
          {(() => {
            const recent = [...recentAssignments]
              .sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1))
              .slice(0, 2);
            return recent.length === 0 ? (
              <div className="rounded-md bg-secondary/50 p-5 text-center">
                <Sparkles className="mx-auto mb-1.5 h-4 w-4 text-muted-foreground/50" />
                <p className="text-[11px] text-muted-foreground">아직 제출된 과제가 없어요</p>
              </div>
            ) : (
              recent.map((a) => (
                <RecentAssignmentItem
                  key={a.id}
                  assignment={a}
                  onFeedbackClick={() => onFeedbackClick(a.id)}
                />
              ))
            );
          })()}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          to={`/mentor/mentees/${mentee.id}/assignments/new`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-white py-2 text-xs font-medium text-foreground transition-all hover:bg-secondary"
        >
          <Plus className="h-3.5 w-3.5" />
          과제 등록
        </Link>
        <Link
          to={`/mentor/mentees/${mentee.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-slate-900 py-2 text-xs font-medium text-white transition-all hover:bg-slate-800"
        >
          상세 보기
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

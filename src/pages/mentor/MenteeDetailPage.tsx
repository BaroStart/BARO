import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { FileText, ListChecks, MessageCircle, Pencil, Plus } from 'lucide-react';

import { UserIcon } from '@/components/icons';
import { AssignmentDetailModal } from '@/components/mentor/AssignmentDetailModal';
import { ChatModal } from '@/components/mentor/ChatModal';
import { FeedbackWriteModal } from '@/components/mentor/FeedbackWriteModal';
import { LearningAnalysisModal } from '@/components/mentor/LearningAnalysisModal';
import {
  CalendarSection,
  DateNavigation,
  FeedbackCard,
  GridCard,
  IncompleteAssignmentCard,
  ProfileSection,
  ScheduleItemCard,
} from '@/components/mentor/menteeDetail';
import { ProfileEditModal } from '@/components/mentor/ProfileEditModal';
import {
  type LearningTaskData,
  type PersonalScheduleData,
  ScheduleAddModal,
} from '@/components/mentor/ScheduleAddModal';
import { type ScheduleItem } from '@/components/mentor/ScheduleCalendar';
import { Button } from '@/components/ui/Button';
import { SUBJECTS } from '@/data/menteeDetailMock';
import { useMentee } from '@/hooks/useMentee';
import {
  useFeedbackItems,
  useIncompleteAssignments,
  useMenteeKpi,
  useMenteeTasks,
  useTodayComment,
} from '@/hooks/useMenteeDetail';
import {
  getMonthRange,
  getTodayDateStr,
  getWeekRange,
  isDateInRange,
  parseDateFromStr,
} from '@/lib/dateUtils';
import {
  getLearningTaskOverrides,
  getLearningTasks,
  saveLearningTaskOverrides,
  saveLearningTasks,
} from '@/lib/learningTaskStorage';
import { getPersonalSchedules, savePersonalSchedules } from '@/lib/personalScheduleStorage';
import { useAssignmentStore } from '@/stores/useAssignmentStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type {
  AssignmentDetail,
  AssignmentSelection,
  FeedbackItem,
  IncompleteAssignment,
  LearningOverrides,
  LearningTaskLocal,
  MenteeSummary,
  ModalType,
  PersonalScheduleLocal,
  ScheduleState,
} from '@/types';

export function MenteeDetailPage() {
  const { menteeId } = useParams<{ menteeId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { removeIncomplete } = useAssignmentStore();
  const { user } = useAuthStore();

  // 날짜/뷰 상태
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr);
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'month'>('today');
  const [feedbackSubjectFilter, setFeedbackSubjectFilter] = useState('전체');

  // 서버 데이터
  const { data: mentee = null, isLoading } = useMentee(menteeId);
  const { data: kpi = null } = useMenteeKpi(menteeId);
  const { data: serverTasks = [] } = useMenteeTasks(menteeId);
  const { data: serverFeedbackItems = [] } = useFeedbackItems(menteeId);
  const { data: serverIncomplete = [] } = useIncompleteAssignments(menteeId, { date: selectedDate });
  const { data: todayComment = null } = useTodayComment(menteeId, selectedDate);

  // 모달 상태 (한 번에 하나만 열림)
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [chatContext, setChatContext] = useState<string | null>(null);
  const [feedbackInitialAssignmentId, setFeedbackInitialAssignmentId] = useState<
    string | undefined
  >();

  // 과제 상세 선택 (모달에 전달할 데이터)
  const [assignmentSelection, setAssignmentSelection] = useState<AssignmentSelection>({
    id: null,
    source: 'feedback',
    feedbackStatus: null,
    fallback: null,
  });

  // 일정 관련 상태
  const [scheduleState, setScheduleState] = useState<ScheduleState>({
    searchQuery: '',
    contextMenu: null,
    draggedItem: null,
  });

  // 로컬 데이터 상태
  const [incompleteAssignments, setIncompleteAssignments] = useState<IncompleteAssignment[]>([]);
  const [feedbackItemsLocal, setFeedbackItemsLocal] = useState<FeedbackItem[]>([]);
  const [personalSchedules, setPersonalSchedules] = useState<PersonalScheduleLocal[]>([]);
  const [learningTasks, setLearningTasks] = useState<LearningTaskLocal[]>([]);
  const [learningOverrides, setLearningOverrides] = useState<LearningOverrides>({
    dateOverrides: {},
    deletedIds: [],
  });

  // 프로필
  const [menteeOverride, setMenteeOverride] = useState<MenteeSummary | null>(null);
  const displayMentee = menteeOverride ?? mentee;

  // 과제 상세 로컬 수정
  const [assignmentDetailOverrides, setAssignmentDetailOverrides] = useState<
    Record<string, Partial<AssignmentDetail>>
  >({});

  // 삭제 확인
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const registeredDate = (location.state as { registeredDate?: string } | null)?.registeredDate;
    if (registeredDate) {
      setSelectedDate(registeredDate);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    setIncompleteAssignments(serverIncomplete);
  }, [serverIncomplete]);

  useEffect(() => {
    if (!menteeId) {
      setPersonalSchedules([]);
      setLearningTasks([]);
      setLearningOverrides({ dateOverrides: {}, deletedIds: [] });
      return;
    }
    setPersonalSchedules(getPersonalSchedules(menteeId));
    setLearningTasks(getLearningTasks(menteeId));
    setLearningOverrides(getLearningTaskOverrides(menteeId));
  }, [menteeId]);

  // 날짜 범위 계산
  const dateRange = useMemo(() => {
    if (viewMode === 'today') return { start: selectedDate, end: selectedDate };
    if (viewMode === 'week') return getWeekRange(selectedDate);
    return getMonthRange(selectedDate);
  }, [viewMode, selectedDate]);

  // 캘린더 아이템 생성
  const scheduleItems: ScheduleItem[] = useMemo(() => {
    const items: ScheduleItem[] = [];

    // 자율학습 To-Do
    const serverLearningTasks = serverTasks
      .filter((t) => t.menteeId === menteeId && !learningOverrides.deletedIds.includes(t.id))
      .map((t) => ({ ...t, date: learningOverrides.dateOverrides[t.id] ?? t.date }));

    [...serverLearningTasks, ...learningTasks].forEach((t) => {
      items.push({
        id: t.id,
        title: t.title,
        subject: t.subject,
        date: t.date,
        type: 'learning',
        status: t.completed ? 'completed' : 'default',
      });
    });

    // 개인 일정
    personalSchedules
      .filter((p) => p.date)
      .forEach((p) => {
        items.push({
          id: p.id,
          title: p.title,
          subject: p.eventType,
          date: p.date,
          type: 'personal',
          status: 'default',
        });
      });

    // 피드백 대시보드
    serverFeedbackItems
      .filter((f) => f.menteeId === menteeId)
      .forEach((f) => {
        const dateStr = parseDateFromStr(f.submittedAt);
        if (dateStr) {
          items.push({
            id: `fb-${f.assignmentId}`,
            title: f.title,
            subject: f.subject,
            date: dateStr,
            type: 'feedback',
            sourceId: f.assignmentId,
            status:
              f.status === 'urgent' ? 'urgent' : f.status === 'completed' ? 'completed' : 'default',
          });
        }
      });

    // 과제: 마감일(dueDate) 기준으로 달력에 표시 (항상 YYYY-MM-DD)
    incompleteAssignments.forEach((a) => {
      const raw = a.deadlineDate ?? a.completedAtDate;
      const dateStr = raw?.includes('T') ? raw.split('T')[0] : raw;
      if (dateStr) {
        items.push({
          id: `asn-${a.id}`,
          title: a.title,
          subject: a.subject,
          date: dateStr,
          type: 'assignment',
          sourceId: a.id,
          status:
            a.status === 'deadline_soon'
              ? 'urgent'
              : a.status === 'completed'
                ? 'completed'
                : 'default',
        });
      }
    });

    return items;
  }, [
    menteeId,
    personalSchedules,
    learningTasks,
    learningOverrides,
    serverTasks,
    serverFeedbackItems,
    incompleteAssignments,
  ]);

  // 오늘 할 일 (자율학습 + 개인일정만)
  const todayTodoItems = useMemo(
    () =>
      scheduleItems.filter((s) => {
        const isCorrectType = s.type === 'learning' || s.type === 'personal';
        if (!isCorrectType) return false;

        if (viewMode === 'today') {
          return s.date === getTodayDateStr();
        } else {
          return isDateInRange(s.date, dateRange.start, dateRange.end);
        }
      }),
    [scheduleItems, viewMode, dateRange],
  );

  // 피드백 아이템 (필터 + 날짜 범위)
  const feedbackItems = useMemo(() => {
    const serverItems = serverFeedbackItems.filter((f) => f.menteeId === menteeId);
    const seen = new Set<string>();
    const baseItems: FeedbackItem[] = [];

    for (const f of [...feedbackItemsLocal, ...serverItems]) {
      if (!seen.has(f.assignmentId)) {
        seen.add(f.assignmentId);
        baseItems.push(f);
      }
    }

    return baseItems
      .filter((f) => feedbackSubjectFilter === '전체' || f.subject === feedbackSubjectFilter)
      .filter((f) => {
        const dateStr =
          f.status === 'completed' && f.feedbackDate
            ? parseDateFromStr(f.feedbackDate)
            : parseDateFromStr(f.submittedAt);
        return !dateStr || isDateInRange(dateStr, dateRange.start, dateRange.end);
      });
  }, [menteeId, feedbackSubjectFilter, feedbackItemsLocal, serverFeedbackItems, dateRange]);

  // 미완료 과제: 선택 기간 내 마감 또는 기한 지난 과제 포함, 마감일 기준 달력에 표시
  const filteredAssignments = useMemo(() => {
    const incomplete = incompleteAssignments.filter((a) => a.status !== 'completed');
    const filtered = incomplete.filter((a) => {
      if (!a.deadlineDate) return true;
      // 기간 내 마감이거나, 마감일이 이미 지난 과제(기한 지남)도 표시
      const inRange = isDateInRange(a.deadlineDate, dateRange.start, dateRange.end);
      const overdue = a.deadlineDate < dateRange.start;
      return inRange || overdue;
    });
    const order = ['deadline_soon', 'not_started', 'in_progress'];
    return [...filtered].sort((a, b) => {
      const statusOrder = order.indexOf(a.status) - order.indexOf(b.status);
      if (statusOrder !== 0) return statusOrder;
      // 같은 상태면 마감일 빠른 순(기한 지난 것 먼저)
      return (a.deadlineDate ?? '').localeCompare(b.deadlineDate ?? '');
    });
  }, [incompleteAssignments, dateRange]);

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => {
    setActiveModal(null);
    setChatContext(null);
    setFeedbackInitialAssignmentId(undefined);
    setAssignmentSelection({ id: null, source: 'feedback', feedbackStatus: null, fallback: null });
  };

  const openAssignmentDetail = (
    id: string,
    fallback?: { title: string; goal?: string; subject?: string },
    source: 'feedback' | 'incomplete' = 'feedback',
    feedbackStatus?: FeedbackItem['status'],
  ) => {
    setAssignmentSelection({
      id,
      source,
      feedbackStatus: feedbackStatus ?? null,
      fallback: fallback ?? null,
    });
    openModal('assignmentDetail');
  };

  const openFeedbackModal = (assignmentId?: string) => {
    setFeedbackInitialAssignmentId(assignmentId);
    openModal('feedback');
  };

  const openChatModal = (context?: string) => {
    setChatContext(context ?? null);
    openModal('chat');
  };

  // 날짜 네비게이션
  const handleDateNav = (delta: number) => {
    const d = new Date(selectedDate);
    if (viewMode === 'week') {
      d.setDate(d.getDate() + delta * 7);
    } else if (viewMode === 'month') {
      d.setMonth(d.getMonth() + delta);
    } else {
      d.setDate(d.getDate() + delta);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleViewMode = (mode: 'today' | 'week' | 'month') => {
    setViewMode(mode);
    if (mode === 'today') setSelectedDate(getTodayDateStr());
  };

  // 일정 저장 헬퍼
  const persistPersonalSchedules = (schedules: typeof personalSchedules) => {
    if (menteeId)
      savePersonalSchedules(
        menteeId,
        schedules.map((p) => ({ ...p, menteeId })),
      );
  };

  const persistLearningTasks = (tasks: typeof learningTasks) => {
    if (menteeId)
      saveLearningTasks(
        menteeId,
        tasks.map((t) => ({ ...t, menteeId })),
      );
  };

  // 일정 추가
  const handleAddPersonalSchedule = (data: PersonalScheduleData) => {
    if (!menteeId) return;
    const next = [
      ...personalSchedules,
      { id: `ps-${Date.now()}`, title: data.title, eventType: data.eventType, date: data.date },
    ];
    setPersonalSchedules(next);
    persistPersonalSchedules(next);
    setSelectedDate(data.date);
  };

  const handleAddLearningTask = (data: LearningTaskData) => {
    if (!menteeId) return;
    const next = [
      ...learningTasks,
      {
        id: `t-${Date.now()}`,
        title: data.title,
        subject: data.subject,
        date: data.date,
        completed: false,
      },
    ];
    setLearningTasks(next);
    persistLearningTasks(next);
    setSelectedDate(data.date);
  };

  // 일정 이동/복사/삭제
  const handleScheduleMove = (itemId: string, newDate: string, skipDateSelect?: boolean) => {
    if (itemId.startsWith('ps-')) {
      const next = personalSchedules.map((p) => (p.id === itemId ? { ...p, date: newDate } : p));
      setPersonalSchedules(next);
      persistPersonalSchedules(next);
    } else {
      const localTask = learningTasks.find((x) => x.id === itemId);
      if (localTask) {
        const next = learningTasks.map((t) => (t.id === itemId ? { ...t, date: newDate } : t));
        setLearningTasks(next);
        persistLearningTasks(next);
      } else {
        const nextOverrides = {
          ...learningOverrides,
          dateOverrides: { ...learningOverrides.dateOverrides, [itemId]: newDate },
        };
        setLearningOverrides(nextOverrides);
        saveLearningTaskOverrides(menteeId ?? '', nextOverrides);
      }
    }
    if (!skipDateSelect) setSelectedDate(newDate);
  };

  const handleScheduleCopy = (itemId: string, newDate: string, skipDateSelect?: boolean) => {
    if (itemId.startsWith('ps-')) {
      const p = personalSchedules.find((x) => x.id === itemId);
      if (p) {
        const next = [...personalSchedules, { ...p, id: `ps-${Date.now()}`, date: newDate }];
        setPersonalSchedules(next);
        persistPersonalSchedules(next);
      }
    } else {
      const src =
        learningTasks.find((x) => x.id === itemId) ??
        serverTasks.find((t) => t.menteeId === menteeId && t.id === itemId);
      if (src) {
        const next = [
          ...learningTasks,
          {
            id: `t-${Date.now()}`,
            title: src.title,
            subject: src.subject,
            date: newDate,
            completed: false,
          },
        ];
        setLearningTasks(next);
        persistLearningTasks(next);
      }
    }
    if (!skipDateSelect) setSelectedDate(newDate);
  };

  const handleScheduleDelete = (itemId: string) => {
    if (itemId.startsWith('ps-')) {
      const next = personalSchedules.filter((p) => p.id !== itemId);
      setPersonalSchedules(next);
      persistPersonalSchedules(next);
    } else {
      const localTask = learningTasks.find((x) => x.id === itemId);
      if (localTask) {
        const next = learningTasks.filter((t) => t.id !== itemId);
        setLearningTasks(next);
        persistLearningTasks(next);
      } else {
        const nextOverrides = {
          ...learningOverrides,
          deletedIds: [...learningOverrides.deletedIds, itemId],
        };
        setLearningOverrides(nextOverrides);
        saveLearningTaskOverrides(menteeId ?? '', nextOverrides);
      }
    }
  };

  // 캘린더 아이템 클릭
  const handleScheduleItemClick = (item: ScheduleItem) => {
    if (item.type === 'feedback' && item.sourceId && menteeId) {
      navigate(`/mentor/mentees/${menteeId}/feedback/${item.sourceId}`);
    } else if (item.type === 'assignment' && item.sourceId) {
      const a = incompleteAssignments.find((x) => x.id === item.sourceId);
      openAssignmentDetail(
        item.sourceId,
        a ? { title: a.title, goal: a.description, subject: a.subject } : undefined,
        'incomplete',
      );
    }
  };

  const handleScheduleItemRightClick = (e: React.MouseEvent, item: ScheduleItem) => {
    e.preventDefault();
    if (item.type === 'personal' || item.type === 'learning') {
      setScheduleState((prev) => ({
        ...prev,
        contextMenu: { item, position: { x: e.clientX, y: e.clientY } },
      }));
    }
  };

  // 과제 완료/삭제
  const handleAssignmentComplete = async (assignmentId: string) => {
    const assignment = incompleteAssignments.find((a) => a.id === assignmentId);
    if (!assignment || !menteeId) return;

    removeIncomplete(assignmentId);
    await queryClient.invalidateQueries({ queryKey: ['incompleteAssignments', menteeId] });

    const datePart = selectedDate.replace(/-/g, '.');
    setFeedbackItemsLocal((prev) => [
      ...prev,
      {
        id: `fb-${assignmentId}-${Date.now()}`,
        assignmentId,
        menteeId,
        title: assignment.title,
        subject: assignment.subject,
        submittedAt: `${datePart} 방금`,
        status: 'pending',
      },
    ]);
  };

  const handleAssignmentDelete = async (id: string) => {
    removeIncomplete(id);
    setDeleteConfirmId(null);
    await queryClient.invalidateQueries({ queryKey: ['incompleteAssignments', menteeId] });
  };

  // 과제 상세 저장
  const handleSaveAssignmentDetail = (id: string, data: Partial<AssignmentDetail>) => {
    setAssignmentDetailOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...data } }));

    if (data.title != null || data.goal != null || data.content != null) {
      setIncompleteAssignments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                ...(data.title != null && { title: data.title }),
                ...(data.goal != null && { description: data.goal }),
                ...(data.content != null && { content: data.content }),
              }
            : a,
        ),
      );

      const { registeredIncomplete, addIncomplete } = useAssignmentStore.getState();
      const registered = registeredIncomplete.find((a) => a.id === id);
      if (registered) {
        addIncomplete([
          {
            ...registered,
            ...(data.title != null && { title: data.title }),
            ...(data.goal != null && { description: data.goal }),
            ...(data.content != null && { content: data.content }),
          },
        ]);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!mentee || !displayMentee) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">멘티를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const [calYear, calMonth] = selectedDate.split('-').map(Number);
  const pendingFeedbackCount = feedbackItems.filter((f) => f.status !== 'completed').length;

  return (
    <div className="space-y-6">
      <ProfileSection
        mentee={displayMentee}
        kpi={kpi}
        mentorSubject={user?.role === 'mentor' ? (user.subject ?? '국어') : undefined}
        onOpenAnalysis={() => openModal('learningAnalysis')}
        onOpenProfile={() => openModal('profileEdit')}
      />

      <DateNavigation
        selectedDate={selectedDate}
        viewMode={viewMode}
        dateRange={dateRange}
        onDateChange={setSelectedDate}
        onPrev={() => handleDateNav(-1)}
        onNext={() => handleDateNav(1)}
        onViewModeChange={handleViewMode}
      />

      <div className="ml-6 flex flex-wrap gap-2">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFeedbackSubjectFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${feedbackSubjectFilter === s ? 'bg-slate-900 text-white shadow-sm' : 'bg-secondary text-foreground/60 hover:bg-secondary/80 hover:text-foreground/80'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GridCard
          title="피드백 대시보드"
          icon={<Pencil className="h-4 w-4" />}
          badge={`${pendingFeedbackCount}개 작성 필요`}
        >
          {feedbackItems.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              onViewAssignment={() =>
                openAssignmentDetail(
                  item.assignmentId,
                  { title: item.title, subject: item.subject },
                  'feedback',
                  item.status,
                )
              }
              onFeedbackClick={() => openFeedbackModal(item.assignmentId)}
            />
          ))}
        </GridCard>

        <GridCard
          title="미완료 과제"
          icon={<FileText className="h-4 w-4" />}
          badge={`총 ${filteredAssignments.length}개`}
          actions={
            <Link to={`/mentor/mentees/${menteeId}/assignments/new`}>
              <Button size="sm" variant="outline" icon={Plus}>
                과제 추가
              </Button>
            </Link>
          }
        >
          {filteredAssignments.map((a) => (
            <IncompleteAssignmentCard
              key={a.id}
              assignment={a}
              onComplete={() => handleAssignmentComplete(a.id)}
              onDelete={() => setDeleteConfirmId(a.id)}
              showDeleteConfirm={deleteConfirmId === a.id}
              onConfirmDelete={() => handleAssignmentDelete(a.id)}
              onCancelDelete={() => setDeleteConfirmId(null)}
              onViewAssignment={() =>
                openAssignmentDetail(
                  a.id,
                  { title: a.title, goal: a.description, subject: a.subject },
                  'incomplete',
                )
              }
            />
          ))}
        </GridCard>

        <GridCard
          title="할 일"
          icon={<ListChecks className="h-4 w-4" />}
          badge={`완료: ${todayTodoItems.filter((i) => i.type === 'learning' && i.status === 'completed').length}/${todayTodoItems.filter((i) => i.type === 'learning').length}`}
        >
          {todayTodoItems.length === 0 ? (
            <p className="flex flex-1 items-center justify-center py-8 text-center text-sm text-muted-foreground">
              오늘 할 일이 없습니다.
            </p>
          ) : (
            todayTodoItems.map((item) => (
              <ScheduleItemCard
                key={item.id}
                item={item}
                onContextMenu={(e) => handleScheduleItemRightClick(e, item)}
                onDelete={() => handleScheduleDelete(item.id)}
              />
            ))
          )}
        </GridCard>

        <GridCard title="오늘의 한마디 & 질문" icon={<MessageCircle className="h-4 w-4" />}>
          {todayComment ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
                  <UserIcon className="h-5 w-5 text-brand" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{todayComment.authorName}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {todayComment.createdAt}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/70">{todayComment.content}</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => openChatModal(todayComment.content)}>
                답변하기
              </Button>
            </div>
          ) : (
            <p className="flex flex-1 items-center justify-center py-8 text-center text-sm text-muted-foreground">
              등록된 질문이 없습니다.
            </p>
          )}
        </GridCard>
      </div>

      <CalendarSection
        year={calYear}
        month={calMonth}
        selectedDate={selectedDate}
        scheduleItems={scheduleItems}
        scheduleState={scheduleState}
        onDateSelect={setSelectedDate}
        onMonthChange={(y, m) => setSelectedDate(`${y}-${String(m).padStart(2, '0')}-01`)}
        onItemClick={handleScheduleItemClick}
        onItemRightClick={handleScheduleItemRightClick}
        onItemDelete={handleScheduleDelete}
        onScheduleStateChange={setScheduleState}
        onScheduleMove={handleScheduleMove}
        onScheduleCopy={handleScheduleCopy}
        onAddClick={() => openModal('scheduleAdd')}
      />

      <ScheduleAddModal
        isOpen={activeModal === 'scheduleAdd'}
        onClose={closeModal}
        defaultDate={selectedDate}
        mode="learning"
        onSubmitPersonal={handleAddPersonalSchedule}
        onSubmitLearning={handleAddLearningTask}
      />

      <LearningAnalysisModal
        isOpen={activeModal === 'learningAnalysis'}
        onClose={closeModal}
        menteeId={menteeId ?? ''}
        menteeName={mentee.name}
      />

      <ChatModal
        isOpen={activeModal === 'chat'}
        onClose={closeModal}
        menteeName={displayMentee.name}
        initialContext={chatContext ?? undefined}
      />

      <ProfileEditModal
        isOpen={activeModal === 'profileEdit'}
        onClose={closeModal}
        mentee={displayMentee}
        mentorSubject={user?.role === 'mentor' ? (user.subject ?? '국어') : '국어'}
        onSave={(data) =>
          setMenteeOverride((prev) => (prev ? { ...prev, ...data } : { ...displayMentee, ...data }))
        }
      />

      <FeedbackWriteModal
        isOpen={activeModal === 'feedback'}
        onClose={closeModal}
        initialMenteeId={menteeId}
        initialAssignmentId={feedbackInitialAssignmentId}
      />

      <AssignmentDetailModal
        isOpen={activeModal === 'assignmentDetail'}
        onClose={closeModal}
        assignmentId={assignmentSelection.id ?? ''}
        source={assignmentSelection.source}
        feedbackStatus={assignmentSelection.feedbackStatus}
        menteeId={menteeId ?? undefined}
        fallback={assignmentSelection.fallback ?? undefined}
        overrides={
          assignmentSelection.source === 'incomplete'
            ? assignmentDetailOverrides[assignmentSelection.id ?? '']
            : undefined
        }
        onSave={
          assignmentSelection.source === 'incomplete'
            ? (data) =>
                assignmentSelection.id && handleSaveAssignmentDetail(assignmentSelection.id, data)
            : undefined
        }
      />
    </div>
  );
}

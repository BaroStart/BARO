import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar } from "@/components/mentee/main/Calendar";
import { AssignmentList } from "@/components/mentee/main/AssignmentList";
import type { AssignmentItem } from "@/components/mentee/main/AssignmentCard";
import { CommentModal } from "@/components/mentee/main/CommentModal";
import { TodoList } from "@/components/mentee/main/TodoList";
import { useTodoStore } from "@/stores/useTodoStore";
import { TimeTable, type TimelineItem } from "@/components/mentee/main/TimeTable";
import { API_CONFIG } from "@/api/config";
import type { TimeRangeValue } from "@/components/mentee/TimeRangeModal";
type TimeSlot = { startTime: string; endTime: string };
import { useAuthStore } from "@/stores/useAuthStore";
import { getWelcomeTitle } from "@/types/auth";
import { getLocalProfileImage } from "@/lib/profileImageStorage";
import { ListIcon, TimeIcon, UserIcon } from "@/components/icons";
import { TimeTableColorModal } from "@/components/mentee/main/TimeTableColorModal";
import { MessageCircle, Palette } from "lucide-react";
import { MOCK_INCOMPLETE_ASSIGNMENTS } from "@/data/menteeDetailMock";
import { useMenteeAssignments } from "@/hooks/useMenteeAssignments";
import { getSubmittedAssignments } from "@/lib/menteeAssignmentSubmissionStorage";
import { useCommentThread } from "@/hooks/useCommentThread";
import { useMenteeCalendar } from "@/hooks/useMenteeCalendar";
import { useMenteeTimetable } from "@/hooks/useMenteeTimetable";

function toHHMM(isoOrTime: string): string {
  if (/^\d{1,2}:\d{2}/.test(isoOrTime)) {
    const [h, m] = isoOrTime.split(":").map(Number);
    return `${String(h ?? 0).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
  }
  const d = new Date(isoOrTime);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function MenteeMainPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateParam) {
      const d = new Date(dateParam);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  useEffect(() => {
    if (dateParam) {
      const d = new Date(dateParam);
      if (!isNaN(d.getTime())) setSelectedDate(d);
    }
  }, [dateParam]);
  const [commentOpen, setCommentOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"LIST" | "TIMETABLE">("LIST");
  const [paletteModalOpen, setPaletteModalOpen] = useState(false);
  const [paletteKey, setPaletteKey] = useState(0);

  const { user } = useAuthStore();
  const welcomeTitle = getWelcomeTitle(user);

  const welcomeMessage = useMemo(() => {
    const messages = [
      "오늘도 기분 좋은 하루의 시작이 되길 바랍니다.",
      "오늘 하루도 응원해요.",
      "조금씩이라도 꾸준히, 잘하고 있어요.",
      "오늘도 할 수 있어요.",
      "작은 걸음이 큰 변화를 만들어요.",
      "오늘 하루도 함께해요.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const {
    todos,
    todosByDate,
    setSelectedDate: setTodoDate,
    addAtTop,
    toggleDone,
    updateTitle,
    remove,
  } = useTodoStore();

  const { thread, handleSubmit: handleCommentSubmit, handleSendReply } = useCommentThread(user);

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const dateKey = `${selectedDate.getFullYear()}-${pad2(selectedDate.getMonth() + 1)}-${pad2(selectedDate.getDate())}`;
  const calendarYear = selectedDate.getFullYear();
  const calendarMonth = selectedDate.getMonth() + 1;

  const { data: calendarRes } = useMenteeCalendar(calendarYear, calendarMonth);
  const apiCalendarList = (calendarRes?.result ?? []) as Array<{ date?: string; hasAssignment?: boolean; hasToDo?: boolean }>;

  const { data: timetableRes } = useMenteeTimetable(dateKey);
  const apiTimetableList = (timetableRes?.result ?? []) as Array<{ name?: string; type?: string; startTime?: string; endTime?: string }>;

  useEffect(() => {
    void setTodoDate(dateKey);
  }, [dateKey, setTodoDate]);

  const toIsoTimeSlot = (baseDate: Date, v: TimeRangeValue): TimeSlot[] => {
    const to24 = (m: "AM" | "PM", hour12: number) => {
      const h = hour12 % 12;
      return m === "PM" ? h + 12 : h;
    };
    const start = new Date(baseDate);
    start.setHours(to24(v.start.meridiem, v.start.hour), v.start.minute, 0, 0);
    const end = new Date(baseDate);
    end.setHours(to24(v.end.meridiem, v.end.hour), v.end.minute, 0, 0);
    return [{ startTime: start.toISOString(), endTime: end.toISOString() }];
  };

  const { data: apiAssignmentsList } = useMenteeAssignments(
    API_CONFIG.useMock ? undefined : { dueDate: dateKey },
    { enabled: !API_CONFIG.useMock },
  );

  const assignmentsByDate = useMemo(() => {
    if (!API_CONFIG.useMock && Array.isArray(apiAssignmentsList) && apiAssignmentsList.length > 0) {
      return apiAssignmentsList.map((a) => {
        const status = a.status === "NOT_SUBMIT" ? ("PENDING" as const) : ("DONE" as const);
        return {
          id: String(a.assignmentId ?? ""),
          dateKey,
          title: a.title ?? "",
          status,
          dueAtText: undefined,
        } satisfies AssignmentItem & { dateKey: string };
      });
    }
    const menteeId = user?.role === "mentee" && /^s\d+$/i.test(user?.id ?? "") ? user.id : "s1";
    const submittedById = user?.id ? getSubmittedAssignments(user.id) : {};

    return MOCK_INCOMPLETE_ASSIGNMENTS.filter((a) => a.menteeId === menteeId).map((a) => {
      const dateKeyMock = a.completedAtDate ?? a.deadlineDate ?? "2026-02-02";
      const isDone = a.status === "completed" || !!submittedById[a.id];
      return {
        id: a.id,
        dateKey: dateKeyMock,
        title: a.title,
        status: isDone ? ("DONE" as const) : ("PENDING" as const),
        dueAtText: isDone ? undefined : a.deadline ?? "23:59",
      } satisfies AssignmentItem & { dateKey: string };
    });
  }, [user?.id, user?.role, dateKey, apiAssignmentsList]);

  const assignments = useMemo<AssignmentItem[]>(() => {
    return assignmentsByDate.filter((a) => a.dateKey === dateKey);
  }, [assignmentsByDate, dateKey]);

  const metaByDate = useMemo(() => {
    const meta: Record<string, { assignmentCount?: number; todoCount?: number }> = {};

    for (const a of assignmentsByDate) {
      meta[a.dateKey] = meta[a.dateKey] ?? {};
      meta[a.dateKey].assignmentCount = (meta[a.dateKey].assignmentCount ?? 0) + 1;
    }

    for (const [k, list] of Object.entries(todosByDate)) {
      meta[k] = meta[k] ?? {};
      meta[k].todoCount = list.length;
    }

    if (!API_CONFIG.useMock) {
      meta[dateKey] = meta[dateKey] ?? {};
      meta[dateKey].todoCount = todos.length;
    }

    if (!API_CONFIG.useMock && apiCalendarList.length) {
      for (const day of apiCalendarList) {
        if (!day.date) continue;
        meta[day.date] = meta[day.date] ?? {};
        if (day.hasAssignment) meta[day.date].assignmentCount = (meta[day.date].assignmentCount ?? 0) + 1;
        if (day.hasToDo) meta[day.date].todoCount = (meta[day.date].todoCount ?? 0) + 1;
      }
    }

    return meta;
  }, [assignmentsByDate, dateKey, todos, todosByDate, apiCalendarList]);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const out: TimelineItem[] = [];
    const pad = (n: number) => String(n).padStart(2, "0");

    for (const t of todos) {
      if (!t.done || !t.timeList?.length) continue;
      for (let i = 0; i < t.timeList.length; i++) {
        const slot = t.timeList[i];
        const start = new Date(slot.startTime);
        const end = new Date(slot.endTime);
        const slotDateKey = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
        if (slotDateKey !== dateKey) continue;

        const startHHMM = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
        const endHHMM = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
        out.push({
          id: `todo-${t.id}-${i}`,
          type: "task",
          title: t.title,
          start: startHHMM,
          end: endHHMM,
        });
      }
    }

    if (!API_CONFIG.useMock && apiTimetableList.length) {
      apiTimetableList.forEach((item, i) => {
        if (item.startTime && item.endTime) {
          out.push({
            id: `api-${i}-${item.name ?? ""}`,
            type: (item.type === "assignment" ? "assignment" : "task") as TimelineItem["type"],
            title: item.name ?? "",
            start: toHHMM(item.startTime),
            end: toHHMM(item.endTime),
          });
        }
      });
    }

    return out.sort((a, b) => a.start.localeCompare(b.start));
  }, [todos, dateKey, apiTimetableList]);

  const handleToggleDone = async (id: number, args?: { timeRange?: TimeRangeValue }) => {
    if (args?.timeRange) {
      await toggleDone(id, { timeList: toIsoTimeSlot(selectedDate, args.timeRange) });
      setViewMode("TIMETABLE");
    } else {
      await toggleDone(id);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-slate-50/50 px-4 pt-4 pb-6">
      {/* 환영 영역 */}
      <section className="mb-4 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            {welcomeTitle}
          </h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            {welcomeMessage}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setCommentOpen(true)}
            aria-label="오늘의 한마디 & 질문"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-600 active:scale-95"
          >
            <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="프로필"
            onClick={() => navigate("/mentee/mypage")}
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-slate-400 transition hover:bg-white hover:opacity-90 active:scale-95"
          >
            {(getLocalProfileImage() || user?.profileImage) ? (
              <img
                src={getLocalProfileImage() || user?.profileImage || ""}
                alt="프로필"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </section>

      <CommentModal
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        onSubmit={handleCommentSubmit}
        onSendReply={handleSendReply}
        thread={thread}
      />

      {/* 캘린더 */}
      <section className="mb-4">
        <Calendar
          value={selectedDate}
          onChange={setSelectedDate}
          metaByDate={metaByDate}
          defaultExpanded={false}
        />
      </section>

      {/* 오늘의 학습 */}
      <section className="rounded-xl border border-slate-100 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">오늘의 학습</h2>

          <div className="flex items-center gap-2">
            {viewMode === "TIMETABLE" && (
              <button
                type="button"
                onClick={() => setPaletteModalOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                aria-label="타임테이블 컬러 팔레트 선택"
              >
                <Palette className="h-4 w-4" strokeWidth={1.8} />
              </button>
            )}
            <div className="flex rounded-lg border border-slate-100 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("LIST")}
                className={[
                  "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                  viewMode === "LIST"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-400",
                ].join(" ")}
                aria-pressed={viewMode === "LIST"}
                aria-label="목록 보기"
              >
                <ListIcon className="h-3.5 w-3.5" />
                목록
              </button>

              <button
                type="button"
                onClick={() => setViewMode("TIMETABLE")}
                className={[
                  "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                  viewMode === "TIMETABLE"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-400",
                ].join(" ")}
                aria-pressed={viewMode === "TIMETABLE"}
                aria-label="타임테이블 보기"
              >
                <TimeIcon className="h-3.5 w-3.5" />
                타임
              </button>
            </div>
          </div>
        </div>

        {viewMode === "LIST" ? (
          <div className="space-y-5">
            <AssignmentList
              items={assignments}
              onOpen={(id) => navigate(`/mentee/assignments/${id}`)}
            />
            <div className="border-t border-slate-100" aria-hidden />
            <TodoList
              items={todos}
              onAddAtTop={(title) => addAtTop(title)}
              onToggleDone={handleToggleDone}
              onUpdateTitle={(id, title) => updateTitle(id, title)}
              onDelete={(id) => remove(id)}
            />
          </div>
        ) : (
          <>
            <TimeTable
              key={paletteKey}
              className="mt-0"
              items={timelineItems}
              dateKey={dateKey}
              selectedDate={selectedDate}
              startHour={6}
              endHour={24}
            />
            <TimeTableColorModal
              open={paletteModalOpen}
              onClose={() => setPaletteModalOpen(false)}
              onSelect={() => setPaletteKey((k) => k + 1)}
              mode="timetable"
            />
          </>
        )}
      </section>
    </div>
  );
}

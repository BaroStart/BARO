import { useEffect, useState } from 'react';

import { Calendar } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/date-picker';
import { DefaultSelect } from '@/components/ui/select';
import { toast } from '@/components/ui/Toast';
import {
  formatPlannerDuration,
  getPlannerCompletedItemsByMenteeAndDate,
  getPlannerRecordsByMenteeAndDate,
  type PlannerCompletedItem,
  type PlannerRecord,
} from '@/data/plannerMock';
import { useMentees } from '@/hooks/useMentees';
import { getTodayDateStr } from '@/lib/dateUtils';
import { getPlannerFeedback, savePlannerFeedback } from '@/lib/plannerFeedbackStorage';

export function PlannerManagePage() {
  const { data: menteesData } = useMentees();
  const mentees = menteesData?.mentees ?? [];
  const [planner, setPlanner] = useState({
    menteeId: '',
    date: getTodayDateStr(),
    feedback: '',
  });

  useEffect(() => {
    if (planner.menteeId && planner.date) {
      const saved = getPlannerFeedback(planner.menteeId, planner.date);
      setPlanner((prev) => ({ ...prev, feedback: saved?.feedbackText ?? '' }));
    }
  }, [planner.menteeId, planner.date]);

  const handleSavePlannerFeedback = () => {
    if (!planner.menteeId || !planner.date) return;
    savePlannerFeedback({
      id: `pf-${planner.menteeId}-${planner.date}`,
      menteeId: planner.menteeId,
      date: planner.date,
      feedbackText: planner.feedback,
      createdAt: new Date().toISOString(),
    });
    toast.success('피드백이 저장되었습니다.');
  };

  return (
    <div className="min-w-0">
      <div className="rounded-xl border border-border/50 bg-white">
        <div className="border-b border-border/50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-foreground/80">멘티 선택</label>
              <DefaultSelect
                value={planner.menteeId}
                onValueChange={(v) => setPlanner((prev) => ({ ...prev, menteeId: v }))}
                placeholder="멘티를 선택하세요"
                options={mentees.map((m) => ({
                  value: m.id,
                  label: `${m.name} (${m.grade} · ${m.track})`,
                }))}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-foreground/80">날짜 선택</label>
              <DatePicker
                value={planner.date}
                onChange={(date) => setPlanner((prev) => ({ ...prev, date }))}
                placeholder="날짜를 선택하세요"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {planner.menteeId ? (
          <div className="p-5">
            <PlannerContent
              menteeId={planner.menteeId}
              date={planner.date}
              feedback={planner.feedback}
              menteeName={mentees.find((m) => m.id === planner.menteeId)?.name ?? ''}
              onFeedbackChange={(v) => setPlanner((prev) => ({ ...prev, feedback: v }))}
              onSaveFeedback={handleSavePlannerFeedback}
            />
          </div>
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-12">
            <div className="text-muted-foreground/40">
              <Calendar className="h-12 w-12" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              멘티를 선택하면 플래너를 확인하고 피드백을 작성할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlannerContent({
  menteeId,
  date,
  feedback,
  menteeName,
  onFeedbackChange,
  onSaveFeedback,
}: {
  menteeId: string;
  date: string;
  feedback: string;
  menteeName: string;
  onFeedbackChange: (v: string) => void;
  onSaveFeedback: () => void;
}) {
  const records = getPlannerRecordsByMenteeAndDate(menteeId, date);
  const completedItems = getPlannerCompletedItemsByMenteeAndDate(menteeId, date);
  const totalHours = (records.reduce((sum, r) => sum + r.durationMinutes, 0) / 60).toFixed(1);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <h3 className="mb-3 text-base font-semibold text-foreground">과제 (학습 기록)</h3>
          {records.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              해당 날짜에 기록된 학습이 없습니다.
            </p>
          ) : (
            <>
              <div className="mb-3 text-sm text-foreground/70">총 학습 시간: {totalHours}시간</div>
              <div className="space-y-2">
                {records
                  .sort((a, b) => b.durationMinutes - a.durationMinutes)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-white px-3 py-2"
                    >
                      <span className="font-medium text-foreground">{r.subject}</span>
                      <span className="font-mono text-sm text-foreground/70">
                        {formatPlannerDuration(r.durationMinutes)}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="mt-4 border-t border-border/50 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">완료된 To-do / 과제</p>
                  <span className="text-xs text-muted-foreground">{completedItems.length}개</span>
                </div>
                {completedItems.length === 0 ? (
                  <p className="py-3 text-center text-sm text-muted-foreground">
                    완료된 To-do/과제가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {completedItems.map((item) => (
                      <CompletedItemRow key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <h3 className="mb-3 text-base font-semibold text-foreground">플래너 피드백</h3>
          <p className="mb-3 text-sm text-muted-foreground">
            {menteeName}님의 학습 기록을 확인하고 피드백을 작성해주세요.
          </p>
          <textarea
            value={feedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            placeholder="예: 오늘 수학 학습 시간이 가장 많았네요. 내일은 영어 독해 비중을 늘려보면 좋겠습니다."
            rows={5}
            className="w-full rounded-lg border border-border/60 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <div className="mt-3 flex justify-end">
            <Button type="button" onClick={onSaveFeedback}>
              피드백 저장
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
        <h3 className="mb-3 text-base font-semibold text-foreground">타임라인</h3>
        {records.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            타임라인을 표시할 학습 기록이 없습니다.
          </p>
        ) : (
          <PlannerTimeline records={records} />
        )}
      </div>
    </div>
  );
}

function PlannerTimeline({ records }: { records: PlannerRecord[] }) {
  const SUBJECT_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    수학: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-400' },
    영어: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-400' },
    국어: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' },
    문학: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-300' },
    사탐: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    한국사: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-300' },
    과탐: { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-400' },
    과학: { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-400' },
  };
  const DEFAULT_STYLE = { bg: 'bg-secondary', text: 'text-foreground/60', dot: 'bg-foreground/30' };

  const hours = Array.from({ length: 15 }, (_, i) => i + 6);
  const sorted = [...records].sort((a, b) => (a.startHour ?? 0) - (b.startHour ?? 0));
  const usedSubjects = [...new Set(records.map((r) => r.subject))];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {usedSubjects.map((subj) => {
          const style = SUBJECT_STYLES[subj] ?? DEFAULT_STYLE;
          return (
            <div key={subj} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
              <span className="text-xs font-medium text-foreground/70">{subj}</span>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-lg border border-border/40">
        {hours.map((hour, idx) => {
          const blocks = sorted.filter((r) => {
            const start = r.startHour ?? 0;
            const end = start + Math.ceil(r.durationMinutes / 60);
            return hour >= start && hour < end;
          });
          const isEven = idx % 2 === 0;
          return (
            <div
              key={hour}
              className={`flex items-center gap-3 px-3 py-1.5 ${isEven ? 'bg-white' : 'bg-secondary/20'} ${idx < hours.length - 1 ? 'border-b border-border/30' : ''}`}
            >
              <span className="w-7 shrink-0 text-right text-[11px] font-medium tabular-nums text-muted-foreground">
                {hour}시
              </span>
              <div className="flex flex-1 gap-1.5">
                {blocks.map((r) => {
                  const style = SUBJECT_STYLES[r.subject] ?? DEFAULT_STYLE;
                  return (
                    <div
                      key={r.id}
                      className={`flex h-7 flex-1 items-center justify-center rounded-md ${style.bg}`}
                      title={`${r.subject} ${formatPlannerDuration(r.durationMinutes)}`}
                    >
                      <span className={`truncate px-1.5 text-[11px] font-medium ${style.text}`}>
                        {r.subject}
                      </span>
                    </div>
                  );
                })}
                {blocks.length === 0 && (
                  <div className="h-7 flex-1 rounded-md border border-dashed border-border/30" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompletedItemRow({ item }: { item: PlannerCompletedItem }) {
  const badgeClass =
    item.type === 'todo' ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700';
  const badgeText = item.type === 'todo' ? '자기주도 TO-DO' : '과제';
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-white px-3 py-2">
      <div className="min-w-0">
        <div className="mb-0.5 flex items-center gap-2">
          <span
            className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClass}`}
          >
            {badgeText}
          </span>
          {item.subject && (
            <span className="inline-flex shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground/60">
              {item.subject}
            </span>
          )}
        </div>
        <p className="truncate text-sm text-foreground/80">{item.title}</p>
      </div>
    </div>
  );
}

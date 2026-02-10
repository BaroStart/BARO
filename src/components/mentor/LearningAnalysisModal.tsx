import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowRight, BarChart3, Calendar, Download, Info } from 'lucide-react';

import { MOCK_MENTEES } from '@/data/mockMentees';
import { SubjectScoresChart, SUBJECT_TO_KEY } from '@/components/mentor/SubjectScoresChart';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { useMentee } from '@/hooks/useMentee';
import { useSubjectStudyTimes, useWeeklyPatterns } from '@/hooks/useLearningAnalysis';
import { useAuthStore } from '@/stores/useAuthStore';
import type { DailyStudyPattern, SubjectStudyTime } from '@/types';

interface LearningAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  menteeId: string;
  menteeName: string;
}

export function LearningAnalysisModal({
  isOpen,
  onClose,
  menteeId,
  menteeName,
}: LearningAnalysisModalProps) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: mentee } = useMentee(menteeId);
  const { data: subjectStudyTimes = [] } = useSubjectStudyTimes(menteeId);
  const { data: weeklyPatterns = [] } = useWeeklyPatterns(menteeId);

  const mentorSubject =
    user?.role === 'mentor' ? (user.subject ?? '국어') : '국어';
  const subjectKey = SUBJECT_TO_KEY[mentorSubject];

  // 학습 분석 대시보드는 항상 목업 성적 사용 (실 API 멘티여도 s1 목업으로 표시)
  const scores = useMemo(
    () =>
      MOCK_MENTEES.find((m) => m.id === menteeId)?.scores ?? MOCK_MENTEES[0]?.scores,
    [menteeId],
  );
  const n = scores?.naesin?.[subjectKey];
  const m = scores?.mockExam?.[subjectKey];
  const hasScores =
    !!scores &&
    (Object.values(n || {}).some((v) => typeof v === 'number') ||
      Object.values(m || {}).some((v) => typeof v === 'number'));

  const baseSubjectData: SubjectStudyTime[] = subjectStudyTimes;
  const baseWeeklyData: DailyStudyPattern[] = weeklyPatterns;

  const subjectData =
    period === 'month'
      ? baseSubjectData.map((s) => ({ ...s, hours: Math.round(s.hours * 4.3) }))
      : baseSubjectData;
  const weeklyData = baseWeeklyData;

  const maxHours = Math.max(...subjectData.map((s) => s.hours), 1);

  const handleDownloadReport = () => {
    let report =
      `${menteeName} 학습 분석 리포트 (${period === 'week' ? '이번 주' : '이번 달'})\n\n`;

    if (hasScores && scores) {
      const n = scores.naesin?.[subjectKey];
      const m = scores.mockExam?.[subjectKey];
      report += `성적 상세 통계 (${mentorSubject}):\n`;
      if (n && typeof n === 'object') {
        report += `  내신: 1학기중간 ${n.midterm1 ?? '-'}, 1학기기말 ${n.final1 ?? '-'}, 2학기중간 ${n.midterm2 ?? '-'}, 2학기기말 ${n.final2 ?? '-'}\n`;
      }
      if (m && typeof m === 'object') {
        report += `  모의고사: 3월 ${m.march ?? '-'}, 6월 ${m.june ?? '-'}, 9월 ${m.september ?? '-'}, 11월 ${m.november ?? '-'}\n`;
      }
      report += '\n';
    }

    report +=
      `과목별 학습 시간:\n` +
      subjectData.map((s) => `  ${s.subject}: ${s.hours}h`).join('\n') +
      `\n\n주간 학습 패턴:\n` +
      weeklyData.map((d) => `  ${d.day}: ${d.hours ?? '-'}h`).join('\n');
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `학습분석_${menteeName}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <Dialog open onClose={onClose} maxWidth="max-w-6xl">
      <DialogHeader onClose={onClose}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            학습 분석 대시보드
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPeriod('week')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                period === 'week'
                  ? 'bg-foreground text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              <Calendar className="h-4 w-4" />
              이번 주
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                period === 'month'
                  ? 'bg-foreground text-white'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              <Calendar className="h-4 w-4" />
              이번 달
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleDownloadReport}
            >
              리포트 다운로드
            </Button>
          </div>
        </div>
      </DialogHeader>

      <DialogBody>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* 과목별 학습 시간 */}
          <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">과목별 학습 시간</h3>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {subjectData.map((item) => (
                <div key={item.subject}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-foreground/80">{item.subject}</span>
                    <span className="text-muted-foreground">{item.hours}h</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="bg-foreground transition-all duration-300"
                      style={{ width: `${(item.hours / maxHours) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 주간 학습 패턴 */}
          <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">주간 학습 패턴</h3>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {weeklyData.map((item) => (
                <div key={item.day} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-sm text-foreground/80">{item.day}</span>
                  <span className="w-12 shrink-0 text-sm font-medium text-foreground">
                    {item.hours != null ? `${item.hours}h` : '-'}
                  </span>
                  <div className="flex flex-1 gap-0.5">
                    {Array.from({ length: item.totalBlocks ?? 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-4 flex-1 rounded-sm ${
                          i < item.filledBlocks ? 'bg-foreground' : 'bg-secondary'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 성적 (그래프) */}
          {hasScores && scores ? (
            <SubjectScoresChart
              scores={scores}
              subjectKey={subjectKey}
              subjectLabel={mentorSubject}
              variant="dashboard"
            />
          ) : (
            <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-border/50 bg-secondary/30 p-4 text-sm text-muted-foreground">
              성적 데이터 없음
            </div>
          )}
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            onClose();
            navigate('/mentor/feedback?tab=analytics');
          }}
        >
          자세히
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

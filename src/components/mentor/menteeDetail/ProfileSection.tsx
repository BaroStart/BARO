import { BarChart3, Calendar, User } from 'lucide-react';

import { UserIcon } from '@/components/icons';
import { SUBJECT_TO_KEY } from '@/components/mentor/SubjectScoresChart';
import { Button } from '@/components/ui/Button';
import { getGradeLabel } from '@/lib/gradeLabels';
import type { MenteeSummary } from '@/types';

import { KpiCard } from './KpiCard';

interface KpiData {
  totalStudyHours: number;
  studyHoursChange: number;
  assignmentCompletionRate: number;
  completionRateChange: number;
  averageScore: number;
  scoreChange: number;
  attendanceRate: number;
  attendanceChange: number;
}

export function ProfileSection({
  mentee,
  kpi,
  mentorSubject,
  onOpenAnalysis,
  onOpenProfile,
}: {
  mentee: MenteeSummary;
  kpi: KpiData | null;
  mentorSubject?: '국어' | '영어' | '수학';
  onOpenAnalysis: () => void;
  onOpenProfile: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary sm:h-14 sm:w-14">
            <UserIcon className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-base font-bold text-foreground sm:text-lg">{mentee.name}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-foreground/70">
                {getGradeLabel(mentee.grade) || mentee.grade} · {mentee.track}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                활동 중
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                멘토링 시작: {mentee.mentoringStart}
              </span>
              <span className="flex items-center gap-1">
                마지막 접속: {mentee.lastActive ?? '정보 없음'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Button variant="outline" size="sm" icon={BarChart3} onClick={onOpenAnalysis}>
            학습 분석
          </Button>
          <Button size="sm" icon={User} onClick={onOpenProfile}>
            프로필 수정
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {kpi && (
            <>
              <KpiCard title="총 학습 시간" value={`${Math.floor(kpi.totalStudyHours)}시간`} />
              <KpiCard
                title="과제 완료율"
                value={`${Math.round(kpi.assignmentCompletionRate * 100)}%`}
              />
            </>
          )}
          {mentee.scores && mentorSubject ? (() => {
            const sk = SUBJECT_TO_KEY[mentorSubject];
            const n = mentee.scores!.naesin?.[sk];
            const vals =
              n && typeof n === 'object'
                ? (['midterm1', 'final1', 'midterm2', 'final2'] as const)
                    .map((k) => n[k])
                    .filter((v): v is number => typeof v === 'number')
                : [];
            if (vals.length === 0) {
              return <KpiCard title="평균 성적" value="성적 입력없음" />;
            }
            const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
            return (
              <KpiCard
                title="평균 성적"
                value={`${avg % 1 === 0 ? avg : avg.toFixed(1)}`}
              />
            );
          })() : (
            <KpiCard title="평균 성적" value="성적 입력없음" />
          )}
        </div>
      </div>
    </div>
  );
}

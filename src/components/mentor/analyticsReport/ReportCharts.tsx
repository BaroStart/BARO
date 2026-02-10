import { KpiCard } from '@/components/mentor/menteeDetail';
import { getGradeLabel } from '@/lib/gradeLabels';

export function ReportHeader({
  mentee,
}: {
  mentee: { name: string; grade: string; track: string } | null | undefined;
}) {
  return (
    <div className="mb-6 border-b-2 border-slate-800 pb-4">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">학생 학습 분석 리포트</h1>
      <div className="text-sm text-slate-600">
        <p>
          학생명: <span className="font-semibold">{mentee?.name}</span> | 학년: {mentee?.grade ? getGradeLabel(mentee.grade) : mentee?.grade} |
          과정: {mentee?.track}
        </p>
        <p>
          작성일:{' '}
          {new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}

export interface KpiData {
  totalStudyHours: number;
  studyHoursChange: number;
  assignmentCompletionRate: number;
  completionRateChange: number;
  averageScore: number;
  scoreChange: number;
  attendanceRate: number;
  attendanceChange: number;
}

export function KpiSummary({ kpi }: { kpi: KpiData | null | undefined }) {
  if (!kpi) return null;
  return (
    <div className="mb-6 grid grid-cols-2 gap-3">
      <KpiCard
        title="총 학습 시간"
        value={`${kpi.totalStudyHours}시간`}
        change={kpi.studyHoursChange}
        suffix="시간"
        className="rounded-lg bg-slate-50 p-3 text-center"
      />
      <KpiCard
        title="과제 완료율"
        value={`${kpi.assignmentCompletionRate}%`}
        change={kpi.completionRateChange}
        suffix="%p"
        className="rounded-lg bg-slate-50 p-3 text-center"
      />
    </div>
  );
}

export function WeeklyPatternsChart({
  weeklyPatterns,
}: {
  weeklyPatterns: { day: string; hours?: number }[];
}) {
  if (weeklyPatterns.length === 0) return null;
  const maxH = Math.max(...weeklyPatterns.map((p) => p.hours || 0), 1);
  const totalHours = weeklyPatterns.reduce((s, p) => s + (p.hours || 0), 0);
  const activeDays = weeklyPatterns.filter((p) => (p.hours || 0) > 0).length || 1;

  return (
    <div className="mb-6">
      <h2 className="mb-3 border-b-2 border-slate-200 pb-2 text-base font-bold text-slate-900">
        생활패턴 분석
      </h2>
      <div className="grid grid-cols-7 gap-2">
        {weeklyPatterns.map((pattern) => {
          const h = ((pattern.hours || 0) / maxH) * 100;
          return (
            <div key={pattern.day} className="text-center">
              <div className="mb-2 text-xs font-medium text-slate-600">{pattern.day}</div>
              <div className="relative mx-auto h-20 w-full rounded-t bg-slate-100">
                <div
                  className="absolute bottom-0 w-full rounded-t bg-slate-600"
                  style={{ height: `${Math.max(h, 5)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-700">{pattern.hours || 0}h</div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="mb-1 font-semibold text-slate-700">주간 총 학습 시간</p>
          <p className="text-lg font-bold text-slate-900">{totalHours}시간</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="mb-1 font-semibold text-slate-700">평균 일일 학습 시간</p>
          <p className="text-lg font-bold text-slate-900">
            {(totalHours / activeDays).toFixed(1)}시간
          </p>
        </div>
      </div>
    </div>
  );
}

export function SubjectStudyTimesChart({
  subjectStudyTimes,
}: {
  subjectStudyTimes: { subject: string; hours: number }[];
}) {
  if (subjectStudyTimes.length === 0) return null;
  const maxH = Math.max(...subjectStudyTimes.map((s) => s.hours), 1);

  return (
    <div className="mb-6">
      <h2 className="mb-3 border-b-2 border-slate-200 pb-2 text-base font-bold text-slate-900">
        과목별 학습 시간
      </h2>
      <div className="space-y-2">
        {subjectStudyTimes
          .sort((a, b) => b.hours - a.hours)
          .map((item) => (
            <div key={item.subject} className="flex items-center gap-3">
              <div className="w-20 text-sm font-medium text-slate-700">{item.subject}</div>
              <div className="flex-1">
                <div className="h-6 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-600"
                    style={{ width: `${(item.hours / maxH) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-right text-sm font-semibold text-slate-900">
                {item.hours}시간
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

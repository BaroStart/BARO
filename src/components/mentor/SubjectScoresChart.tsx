import { useState } from 'react';

import type { MenteeScores } from '@/types';

const NAESIN_KEYS = ['midterm1', 'final1', 'midterm2', 'final2'] as const;
const NAESIN_MONTHS = [4, 7, 10, 12];
const MOCK_EXAM_KEYS = ['march', 'june', 'september', 'november'] as const;
const MOCK_EXAM_MONTHS = [3, 6, 9, 11];

const NAESIN_LABELS: Record<string, string> = {
  midterm1: '1학기 중간',
  final1: '1학기 기말',
  midterm2: '2학기 중간',
  final2: '2학기 기말',
};
const MOCK_EXAM_LABELS: Record<string, string> = {
  march: '3월',
  june: '6월',
  september: '9월',
  november: '11월',
};

/** 점수 → 등급 변환 (수능 기준, 1등급 최상) */
function scoreToGrade(score: number): number {
  if (score >= 92) return 1;
  if (score >= 84) return 2;
  if (score >= 76) return 3;
  if (score >= 68) return 4;
  if (score >= 60) return 5;
  if (score >= 52) return 6;
  if (score >= 44) return 7;
  if (score >= 36) return 8;
  return 9;
}

interface SubjectScoresChartProps {
  scores: MenteeScores;
  subjectKey: 'korean' | 'english' | 'math';
  subjectLabel: string;
  /** compact: 멘티 상세용, dashboard: 대시보드 기본, detail: 대시보드 상세(1행+점수표시) */
  variant?: 'compact' | 'dashboard' | 'detail';
}

export function SubjectScoresChart({
  scores,
  subjectKey,
  subjectLabel,
  variant = 'compact',
}: SubjectScoresChartProps) {
  const naesinData = scores.naesin?.[subjectKey];
  const mockExamData = scores.mockExam?.[subjectKey];

  const naesinPoints: { month: number; value: number }[] = [];
  if (naesinData) {
    NAESIN_KEYS.forEach((k, i) => {
      const v = naesinData[k];
      if (v != null) naesinPoints.push({ month: NAESIN_MONTHS[i], value: v });
    });
  }
  const mockExamPoints: { month: number; value: number }[] = [];
  if (mockExamData) {
    MOCK_EXAM_KEYS.forEach((k, i) => {
      const v = mockExamData[k];
      if (v != null) mockExamPoints.push({ month: MOCK_EXAM_MONTHS[i], value: v });
    });
  }

  const hasData = naesinPoints.length > 0 || mockExamPoints.length > 0;
  const hasNaesin = naesinPoints.length > 0;
  const hasMockExam = mockExamPoints.length > 0;
  const [scoreMode, setScoreMode] = useState<'naesin' | 'mockExam'>(() =>
    hasNaesin ? 'naesin' : 'mockExam'
  );

  const isDetail = variant === 'detail';
  const isDashboard = variant === 'dashboard';

  if (!hasData) return null;

  const activePoints = scoreMode === 'naesin' ? naesinPoints : mockExamPoints;
  const activeSorted =
    scoreMode === 'naesin'
      ? [...naesinPoints].sort((a, b) => a.month - b.month)
      : [...mockExamPoints].sort((a, b) => a.month - b.month);
  if (isDetail) {
    return (
      <div className="flex flex-nowrap items-center gap-x-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
        <span className="shrink-0 text-sm font-semibold text-slate-700">
          {subjectLabel} 성적
        </span>
        {naesinData && (
          <div className="flex shrink-0 items-center gap-x-3">
            <span className="text-xs font-medium text-slate-500">내신</span>
            {NAESIN_KEYS.map((k) => (
              <span key={k} className="flex items-baseline gap-1">
                <span className="text-xs text-slate-500">{NAESIN_LABELS[k]}</span>
                <span className="text-sm font-semibold text-slate-800">
                  {naesinData[k] != null ? naesinData[k] : '-'}
                </span>
              </span>
            ))}
          </div>
        )}
        {naesinData && mockExamData && (
          <span className="h-4 w-px shrink-0 bg-slate-200" aria-hidden />
        )}
        {mockExamData && (
          <div className="flex shrink-0 items-center gap-x-3">
            <span className="text-xs font-medium text-slate-500">모의고사</span>
            {MOCK_EXAM_KEYS.map((k) => (
              <span key={k} className="flex items-baseline gap-1">
                <span className="text-xs text-slate-500">{MOCK_EXAM_LABELS[k]}</span>
                <span className="text-sm font-semibold text-slate-800">
                  {mockExamData[k] != null ? mockExamData[k] : '-'}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  const useGradeScale = isDashboard && scoreMode === 'mockExam';
  const displayPoints = isDashboard ? activePoints : [...naesinPoints, ...mockExamPoints];
  const allVals = displayPoints.map((p) => p.value);
  const minVal = Math.min(...allVals, 100);
  const maxVal = Math.max(...allVals, 0);
  const dataRange = maxVal - minVal;
  const scaleMin =
    useGradeScale
      ? 1
      : dataRange > 0 && dataRange < 40
        ? Math.max(0, Math.floor(minVal / 10) * 10 - 10)
        : 0;
  const scaleMax =
    useGradeScale
      ? 9
      : dataRange > 0 && dataRange < 40
        ? Math.min(100, Math.ceil(maxVal / 10) * 10 + 10)
        : Math.max(100, maxVal, 1);
  const chartW = isDashboard ? 400 : 160;
  const chartH = isDashboard ? 200 : 56;
  const padding = isDashboard
    ? { top: 24, right: 24, bottom: 36, left: 32 }
    : { top: 6, right: 14, bottom: 22, left: 14 };
  const innerW = chartW - padding.left - padding.right;
  const innerH = chartH - padding.top - padding.bottom;
  const showScoreLabels = isDashboard;

  const toY = (v: number) =>
    useGradeScale
      ? padding.top + (innerH * (v - 1)) / 8
      : padding.top + innerH - (innerH * (v - scaleMin)) / (scaleMax - scaleMin);
  const halfW = innerW / 2;
  const monthToX = (month: number) => {
    if (month <= 7) {
      return padding.left + (halfW * (month - 3)) / 4;
    }
    return padding.left + halfW + (halfW * (month - 8)) / 4;
  };
  const indexToX = (i: number, total: number) =>
    padding.left + (innerW * (2 * i + 1)) / (2 * total);

  const naesinSorted = [...naesinPoints].sort((a, b) => a.month - b.month);
  const mockExamSorted = [...mockExamPoints].sort((a, b) => a.month - b.month);
  const naesinPath =
    naesinSorted.length > 0
      ? naesinSorted
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${monthToX(p.month)} ${toY(p.value)}`)
          .join(' ')
      : '';
  const mockExamPath =
    mockExamSorted.length > 0
      ? mockExamSorted
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${monthToX(p.month)} ${toY(p.value)}`)
          .join(' ')
      : '';

  const yTicks = useGradeScale
    ? [1, 3, 5, 7, 9]
    : scaleMax - scaleMin <= 50
      ? [scaleMin, scaleMin + (scaleMax - scaleMin) / 2, scaleMax].filter(
          (v, i, arr) => arr.indexOf(v) === i
        )
      : [0, Math.round(scaleMax / 2), scaleMax].filter(
          (v, i, arr) => arr.indexOf(v) === i
        );

  return (
    <div
      className={
        isDashboard
          ? 'w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/50 p-4'
          : 'rounded-lg border border-slate-200 bg-slate-50 p-3'
      }
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p
          className={
            isDashboard
              ? 'text-sm font-semibold text-slate-700'
              : 'text-xs text-slate-500'
          }
        >
          {subjectLabel} 성적
          {!isDashboard && ' (내신 / 모의고사)'}
        </p>
        {isDashboard && hasNaesin && hasMockExam && (
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            {hasNaesin && (
              <button
                type="button"
                onClick={() => setScoreMode('naesin')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  scoreMode === 'naesin'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                내신
              </button>
            )}
            {hasMockExam && (
              <button
                type="button"
                onClick={() => setScoreMode('mockExam')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  scoreMode === 'mockExam'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                모의고사
              </button>
            )}
          </div>
        )}
      </div>
      <div
        className={
          isDashboard
            ? 'flex w-full flex-col gap-3'
            : 'flex items-start gap-2'
        }
      >
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className={
            isDashboard
              ? 'h-52 w-full min-h-0 shrink-0'
              : 'h-14 w-full max-w-[180px] shrink-0'
          }
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id={`score-area-${subjectKey}`}
              x1="0"
              y1="1"
              x2="0"
              y2="0"
            >
              <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Y축 눈금 (대시보드용) */}
          {showScoreLabels &&
            yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={toY(tick)}
                x2={padding.left + innerW}
                y2={toY(tick)}
                stroke="currentColor"
                strokeOpacity={0.1}
                strokeWidth={0.5}
                strokeDasharray="2 2"
              />
              <text
                x={padding.left - 4}
                y={toY(tick) + 4}
                textAnchor="end"
                fill="rgb(100 116 139)"
                style={{ fontSize: isDashboard ? 9 : 8 }}
              >
                {useGradeScale ? `${tick}등급` : tick}
              </text>
            </g>
          ))}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + innerH}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={0.5}
          />
          <line
            x1={padding.left}
            y1={padding.top + innerH}
            x2={padding.left + innerW}
            y2={padding.top + innerH}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={0.5}
          />
          {!isDashboard && (
            <line
              x1={padding.left + halfW}
              y1={padding.top}
              x2={padding.left + halfW}
              y2={padding.top + innerH}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeWidth={0.5}
            />
          )}
          {isDashboard ? (
            activeSorted.length > 0 && (() => {
              const n = activeSorted.length;
              const linePath = activeSorted
                .map((p, i) => {
                  const x = indexToX(i, n);
                  const yVal = useGradeScale ? scoreToGrade(p.value) : p.value;
                  const y = toY(yVal);
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ');
              const bottomY = padding.top + innerH;
              const areaPath = `${linePath} L ${indexToX(n - 1, n)} ${bottomY} L ${indexToX(0, n)} ${bottomY} Z`;
              return (
                <g>
                  <path
                    d={areaPath}
                    fill={`url(#score-area-${subjectKey})`}
                  />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="rgb(59 130 246)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {activeSorted.map((p, i) => {
                    const x = indexToX(i, n);
                    const yVal = useGradeScale ? scoreToGrade(p.value) : p.value;
                    const y = toY(yVal);
                    const pointLabel = useGradeScale
                      ? `${yVal}등급`
                      : String(p.value);
                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r={3}
                          fill="white"
                          stroke="rgb(59 130 246)"
                          strokeWidth={2}
                        />
                        {showScoreLabels && (
                          <text
                            x={x}
                            y={y - 10}
                            textAnchor="middle"
                            fill="rgb(30 41 59)"
                            style={{ fontSize: 11, fontWeight: 600 }}
                          >
                            {pointLabel}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })()
          ) : (
            <>
              {naesinPath && (
                <g>
                  <path
                    d={naesinPath}
                    fill="none"
                    stroke="rgb(30 41 59)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {naesinSorted.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={monthToX(p.month)}
                        cy={toY(p.value)}
                        r={2.5}
                        fill="rgb(30 41 59)"
                        stroke="white"
                        strokeWidth={1}
                      />
                    </g>
                  ))}
                </g>
              )}
              {mockExamPath && (
                <g>
                  <path
                    d={mockExamPath}
                    fill="none"
                    stroke="rgb(100 116 139)"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {mockExamSorted.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={monthToX(p.month)}
                        cy={toY(p.value)}
                        r={2.5}
                        fill="rgb(100 116 139)"
                        stroke="white"
                        strokeWidth={1}
                      />
                    </g>
                  ))}
                </g>
              )}
            </>
          )}
          {isDashboard && activeSorted.length > 0 ? (
            activeSorted.map((_, i) => {
              const label =
                scoreMode === 'naesin'
                  ? NAESIN_LABELS[NAESIN_KEYS[i]]
                  : MOCK_EXAM_LABELS[MOCK_EXAM_KEYS[i]];
              return (
                <text
                  key={i}
                  x={indexToX(i, activeSorted.length)}
                  y={chartH - 8}
                  textAnchor="middle"
                  fill="rgb(100 116 139)"
                  style={{ fontSize: 10 }}
                >
                  {label}
                </text>
              );
            })
          ) : (
            <>
              <text
                x={padding.left + halfW / 2}
                y={chartH - 4}
                textAnchor="middle"
                fill="rgb(100 116 139)"
                style={{ fontSize: 9 }}
              >
                1학기
              </text>
              <text
                x={padding.left + halfW + halfW / 2}
                y={chartH - 4}
                textAnchor="middle"
                fill="rgb(100 116 139)"
                style={{ fontSize: 9 }}
              >
                2학기
              </text>
            </>
          )}
        </svg>
        {!isDashboard && (
          <div className="flex flex-col gap-0.5 text-xs">
            {naesinPoints.length > 0 && (
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="inline-block h-1.5 w-3 rounded-sm bg-slate-700" />
                내신
              </span>
            )}
            {mockExamPoints.length > 0 && (
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="inline-block h-1.5 w-3 rounded-sm bg-slate-400" />
                모의고사
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const SUBJECT_TO_KEY: Record<string, 'korean' | 'english' | 'math'> = {
  국어: 'korean',
  영어: 'english',
  수학: 'math',
};

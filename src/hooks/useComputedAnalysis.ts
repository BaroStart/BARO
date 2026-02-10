import { useMemo } from 'react';

import type { FeedbackItem } from '@/types';
import type { IncompleteAssignment } from '@/types/assignment';
import type { DailyStudyPattern, SubjectStudyTime } from '@/types/learning';
import type { MenteeKpi } from '@/types/menteeDetail';

export type AnalysisType = {
  strengths: string[];
  weaknesses: string[];
  studyStyle: string[];
  improvements: string[];
  subjectStats: Record<string, { total: number; completed: number; urgent: number }>;
  overallAnalysis: {
    summary: string[];
    strengths: string[];
    weaknesses: string[];
    guidancePoints: string[];
  };
  subjectDetailedAnalysis: Record<
    string,
    {
      studyStyle: string[];
      weakAreas: string[];
      mistakeTypes: string[];
      guidanceDirection: string[];
    }
  >;
  overallGuidance: string[];
};

function extractSubCategory(title: string, subject: string): string {
  const lowerTitle = title.toLowerCase();
  if (subject === '국어') {
    if (lowerTitle.includes('비문학')) return '비문학';
    if (lowerTitle.includes('문학') || lowerTitle.includes('시') || lowerTitle.includes('소설'))
      return '문학';
    if (lowerTitle.includes('문법')) return '문법';
    if (lowerTitle.includes('화법') || lowerTitle.includes('작문')) return '화법과 작문';
    return '기타';
  }
  if (subject === '영어') {
    if (lowerTitle.includes('독해') || lowerTitle.includes('reading')) return '독해';
    if (lowerTitle.includes('듣기') || lowerTitle.includes('listening')) return '듣기';
    if (
      lowerTitle.includes('단어') ||
      lowerTitle.includes('어휘') ||
      lowerTitle.includes('vocabulary')
    )
      return '어휘';
    if (lowerTitle.includes('문법') || lowerTitle.includes('grammar')) return '문법';
    if (lowerTitle.includes('쓰기') || lowerTitle.includes('writing')) return '쓰기';
    return '기타';
  }
  if (subject === '수학') {
    if (lowerTitle.includes('미적분')) return '미적분';
    if (lowerTitle.includes('기하')) return '기하';
    if (lowerTitle.includes('확률') || lowerTitle.includes('통계')) return '확률과 통계';
    if (lowerTitle.includes('수학1') || lowerTitle.includes('수1')) return '수학1';
    if (lowerTitle.includes('수학2') || lowerTitle.includes('수2')) return '수학2';
    return '기타';
  }
  return '기타';
}

interface UseComputedAnalysisParams {
  menteeId: string;
  kpi: MenteeKpi | null | undefined;
  feedbackItems: FeedbackItem[];
  incompleteAssignments: IncompleteAssignment[];
  subjectStudyTimes: SubjectStudyTime[];
  weeklyPatterns: DailyStudyPattern[];
}

export function useComputedAnalysis({
  menteeId,
  kpi,
  feedbackItems,
  incompleteAssignments,
  subjectStudyTimes,
  weeklyPatterns,
}: UseComputedAnalysisParams): AnalysisType | null {
  return useMemo(() => {
    if (!menteeId || !kpi) return null;

    const subjectStats = feedbackItems.reduce(
      (acc, item) => {
        if (!acc[item.subject]) acc[item.subject] = { total: 0, completed: 0, urgent: 0 };
        acc[item.subject].total++;
        if (item.status === 'completed') acc[item.subject].completed++;
        if (item.status === 'urgent') acc[item.subject].urgent++;
        return acc;
      },
      {} as Record<string, { total: number; completed: number; urgent: number }>,
    );

    const subjectDetailStats: Record<
      string,
      Record<string, { total: number; completed: number; urgent: number }>
    > = {};
    feedbackItems.forEach((item) => {
      const subCategory = extractSubCategory(item.title, item.subject);
      if (!subjectDetailStats[item.subject]) subjectDetailStats[item.subject] = {};
      if (!subjectDetailStats[item.subject][subCategory]) {
        subjectDetailStats[item.subject][subCategory] = { total: 0, completed: 0, urgent: 0 };
      }
      subjectDetailStats[item.subject][subCategory].total++;
      if (item.status === 'completed') subjectDetailStats[item.subject][subCategory].completed++;
      if (item.status === 'urgent') subjectDetailStats[item.subject][subCategory].urgent++;
    });

    const strengths: string[] = [];
    Object.entries(subjectDetailStats).forEach(([subject, detailStats]) => {
      Object.entries(detailStats).forEach(([subCategory, stats]) => {
        const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
        if (rate >= 80 && stats.total >= 2)
          strengths.push(`${subject} - ${subCategory} (완료율 ${Math.round(rate)}%)`);
      });
    });
    Object.entries(subjectStats).forEach(([subject, stats]) => {
      const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      if (rate >= 80 && stats.total >= 3)
        strengths.push(`${subject} 전체 (완료율 ${Math.round(rate)}%)`);
    });
    const topStudy = [...subjectStudyTimes].sort((a, b) => b.hours - a.hours)[0];
    if (topStudy && topStudy.hours > 40)
      strengths.push(`${topStudy.subject} (주간 ${topStudy.hours}시간 집중)`);

    const weaknesses: string[] = [];
    Object.entries(subjectDetailStats).forEach(([subject, detailStats]) => {
      Object.entries(detailStats).forEach(([subCategory, stats]) => {
        const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
        if (rate < 50 && stats.total >= 2)
          weaknesses.push(`${subject} - ${subCategory} (완료율 ${Math.round(rate)}%)`);
        if (stats.urgent >= 1)
          weaknesses.push(`${subject} - ${subCategory} (긴급 과제 ${stats.urgent}개)`);
      });
    });
    Object.entries(subjectStats).forEach(([subject, stats]) => {
      const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      if (rate < 50 && stats.total >= 2)
        weaknesses.push(`${subject} 전체 (완료율 ${Math.round(rate)}%)`);
      if (stats.urgent >= 2) weaknesses.push(`${subject} 전체 (긴급 과제 ${stats.urgent}개)`);
    });
    const lowStudy = subjectStudyTimes
      .filter((s) => s.hours > 0)
      .sort((a, b) => a.hours - b.hours)[0];
    if (lowStudy && lowStudy.hours < 20)
      weaknesses.push(`${lowStudy.subject} (주간 ${lowStudy.hours}시간, 부족)`);

    const studyStyle: string[] = [];
    const avgDaily =
      weeklyPatterns.reduce((sum, p) => sum + (p.hours || 0), 0) / (weeklyPatterns.length || 1);
    if (avgDaily >= 3.5) studyStyle.push('매우 꾸준한 학습 습관');
    else if (avgDaily >= 2.5) studyStyle.push('적절한 학습 습관');
    else studyStyle.push('학습 시간 확대 필요');
    const weekendHours =
      (weeklyPatterns.find((p) => p.day === '토요일')?.hours || 0) +
      (weeklyPatterns.find((p) => p.day === '일요일')?.hours || 0);
    if (weekendHours > 5) studyStyle.push('주말 집중형 학습자');
    else if (weekendHours < 2) studyStyle.push('평일 중심 학습자');
    const mostActive = weeklyPatterns
      .filter((p) => p.hours && p.hours > 0)
      .sort((a, b) => (b.hours || 0) - (a.hours || 0))[0];
    if (mostActive) studyStyle.push(`${mostActive.day}에 가장 활발`);

    const improvements: string[] = [];
    if (kpi.assignmentCompletionRate < 80)
      improvements.push(
        `과제 완료율 개선 필요 (현재 ${kpi.assignmentCompletionRate}%, 목표 80% 이상)`,
      );
    if (kpi.completionRateChange < 0)
      improvements.push(`과제 완료율이 ${Math.abs(kpi.completionRateChange)}%p 하락했습니다`);
    if (incompleteAssignments.filter((a) => a.status === 'deadline_soon').length > 0)
      improvements.push('마감 임박 과제가 있어 즉시 처리 필요');
    if (kpi.studyHoursChange < 0)
      improvements.push(`학습 시간이 ${Math.abs(kpi.studyHoursChange)}시간 감소했습니다`);

    const overallAnalysis = {
      summary: [] as string[],
      strengths: [] as string[],
      weaknesses: [] as string[],
      guidancePoints: [] as string[],
    };
    const avgCompletionRate =
      Object.values(subjectStats).reduce(
        (sum, stats) => sum + (stats.total > 0 ? (stats.completed / stats.total) * 100 : 0),
        0,
      ) / (Object.keys(subjectStats).length || 1);
    const weakSubjects = Object.entries(subjectStats)
      .filter(([, s]) => (s.total > 0 ? (s.completed / s.total) * 100 : 0) < 60 && s.total >= 2)
      .map(([sub]) => sub);
    const strongSubjects = Object.entries(subjectStats)
      .filter(([, s]) => (s.total > 0 ? (s.completed / s.total) * 100 : 0) >= 80 && s.total >= 2)
      .map(([sub]) => sub);
    const urgentCount = Object.values(subjectStats).reduce((sum, s) => sum + s.urgent, 0);

    if (avgCompletionRate >= 60) {
      overallAnalysis.summary.push(
        '학생은 기본 개념 이해력은 있는 편이나, 고등 과정에서 요구되는 문제 분석의 깊이와 실수 관리가 아직 충분히 자리 잡지 않은 상태입니다.',
      );
    } else {
      overallAnalysis.summary.push(
        '학생은 기본 개념 이해력 보완이 필요한 상태이며, 고등 과정에서 요구되는 문제 분석의 깊이와 실수 관리가 아직 충분히 자리 잡지 않은 상태입니다.',
      );
    }
    if (weakSubjects.length > 0 && strongSubjects.length > 0) {
      overallAnalysis.summary.push(
        '공부할 때 스스로 약점을 점검하며 보완하기보다는, 비교적 잘 되는 단원이나 익숙한 유형 위주로 학습하려는 경향이 있습니다.',
      );
    }
    if (kpi.completionRateChange < 0 || kpi.scoreChange < 0 || urgentCount > 0) {
      overallAnalysis.summary.push(
        '시험 상황에서는 시간 압박이나 긴장으로 인해 평소보다 실수가 늘어나는 타입으로 보이며, 알고 있는 문제에서도 점수를 놓치는 경우가 종종 발생합니다.',
      );
    }
    overallAnalysis.summary.push(
      '전반적으로 학습량의 문제라기보다는, 공부 방식과 시험 대응 전략을 조정할 필요가 있는 학생입니다.',
    );

    const subjectDetailedAnalysis: Record<
      string,
      {
        studyStyle: string[];
        weakAreas: string[];
        mistakeTypes: string[];
        guidanceDirection: string[];
      }
    > = {};
    ['국어', '영어', '수학'].forEach((subject) => {
      if (!subjectDetailStats[subject]) return;
      const detailStats = subjectDetailStats[subject];
      const subjectStat = subjectStats[subject] || { total: 0, completed: 0, urgent: 0 };
      const completionRate =
        subjectStat.total > 0 ? (subjectStat.completed / subjectStat.total) * 100 : 0;
      const analysis = {
        studyStyle: [] as string[],
        weakAreas: [] as string[],
        mistakeTypes: [] as string[],
        guidanceDirection: [] as string[],
      };

      if (subject === '국어') {
        analysis.studyStyle.push(
          '국어는 감각적으로 접근하는 경향이 있으며, 지문을 체계적으로 분석하기보다는 빠르게 읽고 정답을 찾으려는 편입니다.',
        );
        const 비문학Rate = detailStats['비문학']?.total
          ? (detailStats['비문학'].completed / detailStats['비문학'].total) * 100
          : 0;
        const 문학Rate = detailStats['문학']?.total
          ? (detailStats['문학'].completed / detailStats['문학'].total) * 100
          : 0;
        if (비문학Rate < 70 || completionRate < 70)
          analysis.weakAreas.push(
            '비문학 지문에서 핵심 논지나 근거 문장을 정확히 잡아내지 못하는 경우가 있습니다.',
          );
        if (문학Rate < 70 || completionRate < 70)
          analysis.weakAreas.push(
            '문학에서는 선지 판단 기준이 흔들려 비슷한 선택지에서 오답이 발생하는 경향이 보입니다.',
          );
        if (
          detailStats['문법']?.total &&
          detailStats['문법'].completed < detailStats['문법'].total * 0.8
        )
          analysis.weakAreas.push(
            '내신 서술형에서는 답의 방향은 맞지만 표현이 부족해 감점되는 경우가 있습니다.',
          );
        if (completionRate < 80 && subjectStat.total >= 1)
          analysis.mistakeTypes.push(
            '지문은 이해했으나 문제에서 요구한 조건이나 관점을 놓쳐 오답으로 이어지는 경우가 잦습니다.',
          );
        analysis.guidanceDirection.push(
          '지문을 구조적으로 읽고, 문제에서 요구하는 기준을 먼저 확인하는 훈련을 진행할 예정입니다.',
        );
        analysis.guidanceDirection.push(
          '속도보다는 정확도를 우선으로 하여 실전에서 안정적인 점수를 낼 수 있도록 지도합니다.',
        );
      } else if (subject === '영어') {
        analysis.studyStyle.push(
          '영어는 아는 단어와 익숙한 표현 위주로 해석하는 편이며, 문장 구조가 복잡해질수록 의미를 추측해 문제를 푸는 경향이 있습니다.',
        );
        const 독해Rate = detailStats['독해']?.total
          ? (detailStats['독해'].completed / detailStats['독해'].total) * 100
          : 0;
        const 문법Rate = detailStats['문법']?.total
          ? (detailStats['문법'].completed / detailStats['문법'].total) * 100
          : 0;
        if (독해Rate < 70 || completionRate < 70)
          analysis.weakAreas.push(
            '긴 문장 구조 분석 능력이 부족해 해석이 중간에서 끊기는 경우가 있습니다.',
          );
        if (문법Rate < 70 || completionRate < 70)
          analysis.weakAreas.push(
            '문법은 개념은 알고 있으나 문제에 적용하는 과정에서 실수가 발생합니다.',
          );
        if (
          detailStats['어휘']?.total &&
          detailStats['어휘'].completed < detailStats['어휘'].total * 0.8
        )
          analysis.weakAreas.push('어휘의 정확한 의미와 뉘앙스 구분이 약한 편입니다.');
        if (독해Rate < 80 || completionRate < 80)
          analysis.mistakeTypes.push(
            '문장을 끝까지 해석하지 않고 일부 의미만으로 답을 선택해 오답이 발생하는 경우가 있습니다.',
          );
        analysis.guidanceDirection.push(
          '모든 문제를 문장 구조 분석 후 해석하는 습관을 기르는 데 집중할 예정입니다.',
        );
        analysis.guidanceDirection.push(
          '단어와 문법은 단순 암기가 아닌, 실제 문제 적용 위주로 반복 학습을 진행합니다.',
        );
      } else if (subject === '수학') {
        analysis.studyStyle.push(
          '수학은 개념 이해 속도는 빠른 편이나, 문제를 풀 때 풀이 과정을 정리하지 않고 바로 답을 구하려는 경향이 있습니다.',
        );
        if (subjectStat.urgent > 0 || completionRate < 80)
          analysis.weakAreas.push('계산 실수가 잦고, 문제 조건을 놓치는 경우가 있습니다.');
        if (completionRate < 80)
          analysis.weakAreas.push(
            '풀이 과정이 생략되어 스스로 오류를 발견하지 못하는 경우가 많습니다.',
          );
        if (completionRate < 85) {
          analysis.mistakeTypes.push(
            '풀 수 있는 문제임에도 불구하고 사소한 실수로 점수를 잃는 비중이 높은 학생입니다.',
          );
          analysis.mistakeTypes.push('시험 후에는 아는 문제였다는 반응이 자주 나타납니다.');
        }
        analysis.guidanceDirection.push(
          '문제 풀이 시 조건 확인, 풀이 단계 정리, 검산 과정을 반드시 거치도록 지도할 예정입니다.',
        );
        analysis.guidanceDirection.push(
          '실전 문제를 통해 시간 관리와 안정적인 풀이 습관을 함께 훈련합니다.',
        );
      }

      if (
        analysis.studyStyle.length > 0 ||
        analysis.weakAreas.length > 0 ||
        analysis.mistakeTypes.length > 0 ||
        analysis.guidanceDirection.length > 0
      ) {
        subjectDetailedAnalysis[subject] = analysis;
      }
    });

    const overallGuidance: string[] = [];
    if (avgCompletionRate >= 50) {
      overallGuidance.push(
        '학생은 학습 능력이 부족하다기보다는, 고등 과정에 맞는 공부 방식과 시험 전략이 아직 완전히 정립되지 않은 상태입니다.',
      );
      overallGuidance.push(
        '약점과 실수 유형이 비교적 명확하기 때문에, 이를 중심으로 지도할 경우 내신과 수능 모두에서 성적 향상을 기대할 수 있습니다.',
      );
      overallGuidance.push(
        '학습량을 무작정 늘리기보다는, 정확한 문제 해석과 실수 관리에 초점을 맞춰 지도할 계획입니다.',
      );
    } else {
      overallGuidance.push(
        '학생은 기본 학습 능력 보완과 함께, 고등 과정에 맞는 공부 방식과 시험 전략을 정립할 필요가 있습니다.',
      );
      overallGuidance.push(
        '약점과 실수 유형을 중심으로 지도하여 내신과 수능 모두에서 성적 향상을 기대할 수 있습니다.',
      );
    }

    return {
      strengths,
      weaknesses,
      studyStyle,
      improvements,
      subjectStats,
      overallAnalysis,
      subjectDetailedAnalysis,
      overallGuidance,
    };
  }, [menteeId, kpi, feedbackItems, incompleteAssignments, subjectStudyTimes, weeklyPatterns]);
}

/** 학생이 기록한 일일 학습 플래너 (과목별 학습 시간) */
export interface PlannerRecord {
  id: string;
  menteeId: string;
  date: string; // YYYY-MM-DD
  subject: string;
  durationMinutes: number;
  /** 타임라인용 시작 시각 (0-23) */
  startHour?: number;
  /** 타임라인용 시작 분 (0-59) */
  startMinute?: number;
}

/** 플래너 피드백 (멘토가 작성) */
export interface PlannerFeedback {
  id: string;
  menteeId: string;
  date: string;
  feedbackText: string;
  createdAt: string;
}

/** 플래너 완료 항목 (자기주도 To-do / 과제) */
export interface PlannerCompletedItem {
  id: string;
  menteeId: string;
  date: string; // YYYY-MM-DD
  type: 'todo' | 'assignment';
  title: string;
  subject?: string;
}

const DEMO_DATE = '2026-02-04';

export const MOCK_PLANNER_RECORDS: PlannerRecord[] = [
  {
    id: 'pr1',
    menteeId: 's1',
    date: DEMO_DATE,
    subject: '수학',
    durationMinutes: 172,
    startHour: 6,
    startMinute: 10,
  },
  {
    id: 'pr2',
    menteeId: 's1',
    date: DEMO_DATE,
    subject: '영어',
    durationMinutes: 160,
    startHour: 9,
    startMinute: 15,
  },
  {
    id: 'pr3',
    menteeId: 's1',
    date: DEMO_DATE,
    subject: '사탐',
    durationMinutes: 74,
    startHour: 12,
    startMinute: 10,
  },
  {
    id: 'pr4',
    menteeId: 's1',
    date: DEMO_DATE,
    subject: '한국사',
    durationMinutes: 85,
    startHour: 13,
    startMinute: 30,
  },
  {
    id: 'pr5',
    menteeId: 's1',
    date: DEMO_DATE,
    subject: '문학',
    durationMinutes: 26,
    startHour: 15,
    startMinute: 5,
  },
  {
    id: 'pr6',
    menteeId: 's1',
    date: DEMO_DATE,
    subject: '과탐',
    durationMinutes: 37,
    startHour: 17,
    startMinute: 40,
  },
  {
    id: 'pr7',
    menteeId: 's2',
    date: DEMO_DATE,
    subject: '수학',
    durationMinutes: 120,
    startHour: 8,
    startMinute: 0,
  },
  {
    id: 'pr8',
    menteeId: 's2',
    date: DEMO_DATE,
    subject: '영어',
    durationMinutes: 90,
    startHour: 11,
    startMinute: 20,
  },
  {
    id: 'pr9',
    menteeId: 's2',
    date: DEMO_DATE,
    subject: '과학',
    durationMinutes: 60,
    startHour: 14,
    startMinute: 0,
  },
  {
    id: 'pr10',
    menteeId: 's1',
    date: '2026-02-03',
    subject: '수학',
    durationMinutes: 90,
    startHour: 9,
    startMinute: 0,
  },
  {
    id: 'pr11',
    menteeId: 's1',
    date: '2026-02-03',
    subject: '영어',
    durationMinutes: 75,
    startHour: 11,
    startMinute: 0,
  },
];

export const MOCK_PLANNER_COMPLETED_ITEMS: PlannerCompletedItem[] = [
  {
    id: 'pci-1',
    menteeId: 's1',
    date: DEMO_DATE,
    type: 'todo',
    title: '자기주도: 오답노트 20분',
    subject: '자기주도',
  },
  {
    id: 'pci-2',
    menteeId: 's1',
    date: DEMO_DATE,
    type: 'assignment',
    title: '수학 문제집 3단원 (Day 12)',
    subject: '수학',
  },
  {
    id: 'pci-3',
    menteeId: 's1',
    date: DEMO_DATE,
    type: 'assignment',
    title: '영어 단어 Day 12 테스트',
    subject: '영어',
  },
  {
    id: 'pci-4',
    menteeId: 's2',
    date: DEMO_DATE,
    type: 'todo',
    title: '자기주도: 오늘 학습 회고 작성',
    subject: '자기주도',
  },
];

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const s = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getPlannerRecordsByMenteeAndDate(menteeId: string, date: string): PlannerRecord[] {
  return MOCK_PLANNER_RECORDS.filter((r) => r.menteeId === menteeId && r.date === date);
}

export function getPlannerCompletedItemsByMenteeAndDate(
  menteeId: string,
  date: string,
): PlannerCompletedItem[] {
  return MOCK_PLANNER_COMPLETED_ITEMS.filter((x) => x.menteeId === menteeId && x.date === date);
}

export function formatPlannerDuration(minutes: number): string {
  return formatDuration(minutes);
}

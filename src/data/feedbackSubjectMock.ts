/**
 * 피드백 과목용 목업 데이터
 * - 과목별 피드백을 한눈에 이해할 수 있도록 구조화
 */

export type FeedbackSubjectStatus = "NEW" | "READ" | "NO_FEEDBACK";

export type FeedbackSubjectItem = {
  id: string;
  subject: "KOREAN" | "ENGLISH" | "MATH" | "ETC";
  subjectLabel: string;
  mentorName: string;
  mentorAvatar?: string;
  status: FeedbackSubjectStatus;
  feedbackSummary: string;
  feedbackFull?: string;
  timeText: string;
  assignmentCount: number;
  assignmentIds: string[];
  assignmentTitles?: string[];
};

export const MOCK_FEEDBACK_BY_SUBJECT: Record<string, FeedbackSubjectItem[]> = {
  "2026-02-06": [
    {
      id: "fb-math-1",
      subject: "MATH",
      subjectLabel: "수학",
      mentorName: "김민준",
      mentorAvatar: undefined,
      status: "NEW",
      feedbackSummary:
        "적분 문제 치환적분 활용 좋아요. 부호 실수만 줄이면 더 좋겠어요.",
      feedbackFull:
        "오늘 풀이한 적분 문제에서 치환적분 활용이 정말 좋았습니다!\n다만 부호 실수가 2문제에서 보였어요.\n검산 습관을 들이면 충분히 줄일 수 있을 것 같아요.",
      timeText: "14:30",
      assignmentCount: 3,
      assignmentIds: ["a-101", "a-102", "a-103"],
      assignmentTitles: ["적분 기본", "치환적분", "부분적분"],
    },
    {
      id: "fb-kor-1",
      subject: "KOREAN",
      subjectLabel: "국어",
      mentorName: "김민준",
      status: "READ",
      feedbackSummary:
        "시 감상에서 화자 정서 파악 좋았어요. 상징어 해석도 전반적으로 우수합니다.",
      timeText: "13:10",
      assignmentCount: 2,
      assignmentIds: ["a-102", "a-104"],
      assignmentTitles: ["고전시가 감상", "현대시 분석"],
    },
  ],
  "2026-02-07": [
    {
      id: "fb-eng-1",
      subject: "ENGLISH",
      subjectLabel: "영어",
      mentorName: "김민준",
      status: "NEW",
      feedbackSummary:
        "문단별 요약 좋아요. 근거 문장 표시를 한 번 더 해보면 정확도가 올라갑니다.",
      timeText: "11:05",
      assignmentCount: 1,
      assignmentIds: ["a-201"],
      assignmentTitles: ["독해 - 주제문 찾기"],
    },
  ],
  "2026-02-08": [],
  "2026-02-09": [
    {
      id: "fb-math-2",
      subject: "MATH",
      subjectLabel: "수학",
      mentorName: "박서연",
      status: "NEW",
      feedbackSummary:
        "미분 단원 기본기가 탄탄해요. 이제 응용 문제 연습을 늘려보세요.",
      timeText: "방금 전",
      assignmentCount: 2,
      assignmentIds: ["a-301", "a-302"],
      assignmentTitles: ["미분 기본", "도함수 활용"],
    },
    {
      id: "fb-kor-2",
      subject: "KOREAN",
      subjectLabel: "국어",
      mentorName: "박서연",
      status: "READ",
      feedbackSummary: "문학 비평 관점이 날로 성장하고 있어요. 계속 써보세요.",
      timeText: "2시간 전",
      assignmentCount: 1,
      assignmentIds: ["a-303"],
      assignmentTitles: ["문학 비평 작성"],
    },
  ],
};

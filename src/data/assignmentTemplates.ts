export type AssignmentTemplate = {
  id: string;
  title: string;
  description: string;
  variables?: string[];
  checklist: string[];
  submitRule?: string;
  source?: 'example' | 'custom';
};

// TODO: API 연결 — 예시 템플릿 데이터를 서버에서 가져오기
export const ASSIGNMENT_TEMPLATES: AssignmentTemplate[] = [
  {
    id: 'tpl-vocab-memo',
    title: '영어단어 암기 Day {DAY}',
    description: 'Day별 단어 학습 + 테스트 + 오답 정리까지 한 번에.',
    variables: ['{DAY}'],
    checklist: [
      '단어 1회독(뜻/품사) 완료',
      '예문 10개 소리내어 읽기',
      '테스트(한→영 / 영→한) 각 1회',
      '오답 10개 오답노트 작성',
    ],
    submitRule: '테스트 점수(또는 오답 개수) + 오답 10개 기록/캡처',
    source: 'example',
  },
  {
    id: 'tpl-vocab-review',
    title: '단어 복습 루틴 (D+1 / D+3 / D+7) Day {DAY}',
    description: '스페이싱 복습으로 장기 기억을 유지하는 반복 과제.',
    variables: ['{DAY}'],
    checklist: ['D+1 복습(전날) 10분', 'D+3 복습 10분', 'D+7 복습 10분', '최종 오답 5개만 남기기'],
    submitRule: '각 복습 세트 오답 개수 기록(예: 3/2/1)',
    source: 'example',
  },
  {
    id: 'tpl-vocab-sentences',
    title: '단어 → 문장 적용 Day {DAY}',
    description: '오늘 외운 단어를 "내 문장"으로 고정해서 실전 적용.',
    variables: ['{DAY}'],
    checklist: [
      '핵심 단어 15개 선정',
      '단어당 문장 1개씩(총 15문장)',
      '틀린 문장 5개만 교정(왜 틀렸는지 1줄)',
    ],
    submitRule: '15문장 텍스트 + 교정 5개 표시',
    source: 'example',
  },
  {
    id: 'tpl-vocab-cumulative-quiz',
    title: '누적 단어 퀴즈 (Day 1~{DAY})',
    description: '누적 범위 랜덤 테스트로 "기억 유지"를 확인.',
    variables: ['{DAY}'],
    checklist: [
      '누적 50문항 퀴즈(앱/자체)',
      '오답 10개 추려 재시험',
      '오답 원인 분류(뜻/철자/혼동/예문)',
    ],
    submitRule: '점수 + 오답 원인 분류 결과',
    source: 'example',
  },
  {
    id: 'tpl-shadowing',
    title: '쉐도잉 15분 (매일 루틴)',
    description: '짧게라도 매일 유지하는 루틴형 과제 템플릿.',
    checklist: [
      '1회: 듣기만(스크립트 X)',
      '2회: 스크립트 보며 쉐도잉',
      '3회: 스크립트 없이 쉐도잉',
      '어려웠던 표현 3개 기록',
    ],
    submitRule: '표현 3개 + 오늘 난이도(1~5)',
    source: 'example',
  },
];

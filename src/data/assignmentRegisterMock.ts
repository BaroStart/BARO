export interface ImprovementPoint {
  id: string;
  subject: '국어' | '영어' | '수학';
  subCategory: string;
  label: string;
  description?: string;
  /** 연결된 학습지 ID 목록 */
  materialIds: string[];
  /** 칼럼 템플릿 (있으면 미리 채움, 없으면 빈 에디터) */
  columnTemplate?: string;
}

/** 학습 자료 (PDF 등) */
export interface LearningMaterial {
  id: string;
  title: string;
  fileSize?: string;
  improvementPointId?: string;
  subject?: string;
  source: 'seolstudy' | 'mentor';
  url?: string;
}

/** 임시저장된 과제 초안 */
export interface DraftAssignment {
  id: string;
  menteeId: string;
  menteeName: string;
  title: string;
  subject: string;
  savedAt: string;
  formData: Record<string, unknown>;
}

/** 동기부여·학습법 칼럼 템플릿 (설스터디 서울대쌤 칼럼) */
export interface MotivationalColumnTemplate {
  id: string;
  category: '생활 습관&동기부여' | '국영수 공부법';
  label: string;
  content: string;
}

export const MOTIVATIONAL_COLUMN_TEMPLATES: MotivationalColumnTemplate[] = [
  {
    id: 'mot1',
    category: '생활 습관&동기부여',
    label: '짧은 시간의 힘, 자투리 10분이 성적을 바꾼다',
    content: `<h3>짧은 시간의 힘, 자투리 10분이 성적을 바꾼다</h3>
<p>안녕하세요. 서울대학교에 재학 중인 멘토입니다.</p>
<p>바쁜 일상 속에서도 자투리 시간을 활용하는 법을 알아보겠습니다.</p>
<p><strong>자투리 10분 활용법</strong></p>
<ul>
  <li>이동 시간: 단어 암기, 오디오 강의 청취</li>
  <li>점심 후: 짧은 퀴즈, 복습 노트 확인</li>
  <li>잠들기 전: 오늘 배운 것 3가지 떠올리기</li>
</ul>
<p><strong>💡 멘토 TIP</strong>: 작은 시간이라도 매일 반복하면 큰 차이를 만듭니다.</p>`,
  },
  {
    id: 'mot2',
    category: '생활 습관&동기부여',
    label: '공부가 하기 싫은 날, 그래도 포기하지 않는 법',
    content: `<h3>공부가 하기 싫은 날, 그래도 포기하지 않는 법</h3>
<p>안녕하세요. 서울대학교에 재학 중인 윤서열입니다. 저는 고등학교 3년 내내 전교 1등을 유지하며 공부했습니다. 하지만 저도 매일 의욕이 넘치는 학생은 아니었어요.</p>
<p><strong>공부할 때는 집중하고, 쉴 때는 확실히 쉬기</strong></p>
<p>집중력이 낮을 때 억지로 공부하면 오히려 비효율적입니다. 평소에는 열심히 공부하고, 주말에는 확실히 쉬는 것이 중요합니다. (단, 시험 기간이 아닐 때 한정)</p>
<ul>
  <li>평일: 스마트폰은 멀리 두고 집중해서 공부하기</li>
  <li>주말: 충분히 쉬고, 원할 때만 스마트폰 사용하기</li>
</ul>
<p><strong>💡 멘토 TIP</strong>: 무리하지 말고, 자신의 리듬을 찾아가세요.</p>`,
  },
  {
    id: 'mot3',
    category: '생활 습관&동기부여',
    label: '지금 당장 생산적인 공부를 하는 법 (1)',
    content: `<h3>지금 당장 생산적인 공부를 하는 법 (1)</h3>
<p>생산적인 공부를 위한 첫 번째 단계를 소개합니다.</p>
<p><strong>환경 정리</strong></p>
<ul>
  <li>책상 위 불필요한 물건 치우기</li>
  <li>스마트폰 무음 모드 또는 다른 방에 두기</li>
  <li>명확한 목표와 시간 설정하기</li>
</ul>
<p><strong>💡 멘토 TIP</strong>: 5분이라도 시작하면 몰입이 됩니다.</p>`,
  },
  {
    id: 'mot4',
    category: '생활 습관&동기부여',
    label: "'나만의 공부 커리큘럼'을 만들자",
    content: `<h3>'나만의 공부 커리큘럼'을 만들자</h3>
<p>맞춤형 학습 계획을 세우는 방법을 알아봅니다.</p>
<p><strong>커리큘럼 설계 단계</strong></p>
<ol>
  <li>현재 실력 진단</li>
  <li>목표 설정 (단기/중기/장기)</li>
  <li>주간·일일 계획표 작성</li>
  <li>정기 점검 및 수정</li>
</ol>
<p><strong>💡 멘토 TIP</strong>: 완벽한 계획보다 실행 가능한 계획이 중요합니다.</p>`,
  },
  {
    id: 'mot5',
    category: '국영수 공부법',
    label: '영어 내신 공부법: 상위권이 되는 현실적인 방법',
    content: `<h3>영어 내신 공부법: 상위권이 되는 현실적인 방법</h3>
<p>영어 내신에서 상위권이 되기 위한 실전 전략을 소개합니다.</p>
<p><strong>학습 포인트</strong></p>
<ul>
  <li>교과서 본문 완전 암기</li>
  <li>문법 포인트별 정리 및 예문 암기</li>
  <li>서술형 유형별 답안 패턴 익히기</li>
</ul>
<p><strong>💡 멘토 TIP</strong>: 내신은 교과서가 기본입니다. 반복이 핵심입니다.</p>`,
  },
  {
    id: 'mot6',
    category: '국영수 공부법',
    label: '국어 내신 공부법: 과목별로 달라지는 전략',
    content: `<h3>국어 내신 공부법: 과목별로 달라지는 전략</h3>
<p>문학, 비문학, 문법 등 과목별 맞춤 전략을 알아봅니다.</p>
<p><strong>과목별 전략</strong></p>
<ul>
  <li>문학: 작품별 핵심 정리, 시/소설/극 구분 학습</li>
  <li>비문학: 지문 유형별 접근법, 속도 훈련</li>
  <li>문법: 개념 정리 후 예외 사항 암기</li>
</ul>
<p><strong>💡 멘토 TIP</strong>: 학교 시험 범위를 먼저 파악하고 우선순위를 정하세요.</p>`,
  },
  {
    id: 'mot7',
    category: '국영수 공부법',
    label: '내신·수능 공동 수학 공부법: 오답노트 작성법',
    content: `<h3>내신·수능 공동 수학 공부법: 오답노트 작성법</h3>
<p>수학 오답노트를 효과적으로 작성하는 방법을 소개합니다.</p>
<p><strong>오답노트 작성 포인트</strong></p>
<ul>
  <li>틀린 이유(개념/계산/실수) 명확히 기록</li>
  <li>해결 과정 단계별로 정리</li>
  <li>유사 문제 함께 수록하여 패턴 파악</li>
</ul>
<p><strong>💡 멘토 TIP</strong>: 오답노트는 '다시 풀기'가 핵심입니다. 정기적으로 복습하세요.</p>`,
  },
  {
    id: 'mot8',
    category: '국영수 공부법',
    label: "수능 국어 공부법: '읽어야 할 것을 읽는 것'이 전부입니다",
    content: `<h3>수능 국어 공부법: '읽어야 할 것을 읽는 것'이 전부입니다</h3>
<p>수능 국어의 본질은 '올바른 독해'입니다.</p>
<p><strong>핵심 원칙</strong></p>
<ul>
  <li>지문의 핵심 문장만 골라 읽기</li>
  <li>문제에서 요구하는 정보에 집중하기</li>
  <li>불필요한 정보는 과감히 건너뛰기</li>
</ul>
<p><strong>💡 멘토 TIP</strong>: 많이 읽는 것보다 '어떻게' 읽는지가 중요합니다.</p>`,
  },
];

export const SUBJECT_COLUMN_TEMPLATES: Record<string, string> = {
  국어: `<h3>국어 학습 가이드</h3>
<p>이번 과제의 학습 목표를 확인하고 단계별로 진행해 보세요.</p>
<ul>
  <li><strong>학습 목표</strong>: 지문의 핵심 내용 파악하기</li>
  <li><strong>학습 방법</strong>: 제목과 첫 문장부터 읽으며 주제 예측하기</li>
  <li><strong>💡 멘토 TIP</strong>: 긴 지문은 단락별로 나누어 읽어보세요.</li>
</ul>`,
  영어: `<h3>영어 독해 학습 가이드</h3>
<p>영어 독해 전략을 활용하여 지문을 분석해 보세요.</p>
<p><strong>학습 목표</strong></p>
<ul>
  <li>토픽 센텐스의 위치와 특징 이해하기</li>
  <li>단락 구조 분석 능력 기르기</li>
  <li>실전 문제 10개 풀고 오답 분석하기</li>
</ul>
<p><strong>독해 지문 읽기 순서</strong></p>
<ol>
  <li>제목과 첫 문장 확인 - 주제 예측</li>
  <li>각 단락 첫 문장 읽기 - 전체 구조 파악</li>
  <li>상세 내용 읽기 - 핵심 근거와 예시 찾기</li>
</ol>
<p><strong>💡 멘토 TIP</strong>: 효율적인 학습을 위해 타이머를 활용해 보세요.</p>`,
  수학: `<h3>수학 학습 가이드</h3>
<p>개념을 정확히 이해한 후 문제풀이에 임해 보세요.</p>
<ul>
  <li><strong>학습 목표</strong>: 기본 개념 완전 이해 및 기본 문제 풀이 숙달</li>
  <li><strong>학습 순서</strong>: 개념 정리 → 예제 풀이 → 연습문제</li>
  <li><strong>💡 멘토 TIP</strong>: 오답노트를 활용해 틀린 유형을 반복 학습하세요.</li>
</ul>`,
};

const COLUMN_TEMPLATES: Record<string, string> = {
  ip1: `<h3>비문학 지문 구조 파악</h3>
<p>주제문·핵심문장의 위치를 파악하는 연습을 해 보세요.</p>
<ul>
  <li>각 단락의 첫 문장에 주목하기</li>
  <li>접속사(그러나, 따라서 등)로 흐름 파악하기</li>
  <li>지문 3개 읽고 구조 요약하기</li>
</ul>`,
  ip3: `<h3>영어 독해 지문 구조 분석</h3>
<p>토픽 센텐스 위치 파악, 단락 구조 분석 능력을 기르세요.</p>
<p><strong>학습 목표</strong></p>
<ul>
  <li>Understand the location and characteristics of topic sentences</li>
  <li>Develop the ability to analyze paragraph structure</li>
  <li>Solve 10 practical problems and analyze incorrect answers</li>
</ul>
<p><strong>독해 지문 읽기 순서</strong></p>
<ol>
  <li>Check the title and first sentence - predict the main topic</li>
  <li>Read the first sentence of each paragraph - grasp the overall structure</li>
  <li>Read the detailed content - find key evidence and examples</li>
</ol>
<p><strong>💡 멘토 TIP</strong>: 긴 지문도 끝까지 집중해서 읽는 연습을 해 보세요.</p>`,
  ip4: `<h3>핵심 어휘 암기 가이드</h3>
<p>수능 필수 어휘 50개를 암기하고 문장에서 활용해 보세요.</p>
<ul>
  <li>단어장 1일치(50개) 암기</li>
  <li>예문 3개 이상 읽고 문맥 파악</li>
  <li>자기 테스트 - 뜻 맞추기</li>
</ul>`,
  ip5: `<h3>미적분 - 미분 기본 개념</h3>
<p>미분의 정의와 기본 공식을 정확히 이해하세요.</p>
<ul>
  <li>미분계수의 정의 복습</li>
  <li>기본 미분 공식 암기 및 적용</li>
  <li>연습문제 1-20번 풀이</li>
</ul>`,
};

export const MOCK_IMPROVEMENT_POINTS: ImprovementPoint[] = [
  {
    id: 'ip1',
    subject: '국어',
    subCategory: '비문학',
    label: '지문 구조 파악',
    description: '주제문·핵심문장 위치 파악',
    materialIds: ['mat1'],
    columnTemplate: COLUMN_TEMPLATES.ip1,
  },
  {
    id: 'ip2',
    subject: '국어',
    subCategory: '문학',
    label: '시 감상 분석',
    description: '시적 화자와 표현 기법 이해',
    materialIds: ['mat2'],
  },
  {
    id: 'ip2-1',
    subject: '국어',
    subCategory: '문학',
    label: '문학 문풀',
    description: '문학 작품 문제 풀이',
    materialIds: ['mat2'],
  },
  {
    id: 'ip2-2',
    subject: '국어',
    subCategory: '문법',
    label: '문법 강의/오답노트',
    description: '문법 개념 정리 및 오답 분석',
    materialIds: ['mat2'],
  },
  {
    id: 'ip3',
    subject: '영어',
    subCategory: '독해/듣기/어휘',
    label: '독해 지문 구조 분석',
    description: '토픽 센텐스 위치 파악, 단락 구조 분석',
    materialIds: ['mat3', 'mat4'],
    columnTemplate: COLUMN_TEMPLATES.ip3,
  },
  {
    id: 'ip4',
    subject: '영어',
    subCategory: '독해/듣기/어휘',
    label: '핵심 어휘 암기',
    description: '수능 필수 어휘 50개',
    materialIds: ['mat5'],
    columnTemplate: COLUMN_TEMPLATES.ip4,
  },
  {
    id: 'ip4-1',
    subject: '영어',
    subCategory: '독해/듣기/어휘',
    label: '단어 시험',
    description: '어휘 암기 확인 테스트',
    materialIds: ['mat5'],
  },
  {
    id: 'ip4-2',
    subject: '영어',
    subCategory: '독해/듣기/어휘',
    label: '단어 암기',
    description: 'Vocabulary Memorization',
    materialIds: ['mat5'],
  },
  {
    id: 'ip4-3',
    subject: '영어',
    subCategory: '독해/듣기/어휘',
    label: '유형별 문제',
    description: 'Problem by Type',
    materialIds: ['mat3', 'mat4'],
  },
  {
    id: 'ip5',
    subject: '수학',
    subCategory: '미적분',
    label: '미분 기본 개념',
    description: '미분의 정의와 기본 공식',
    materialIds: ['mat6'],
    columnTemplate: COLUMN_TEMPLATES.ip5,
  },
  {
    id: 'ip6',
    subject: '수학',
    subCategory: '기하',
    label: '벡터 연산',
    description: '벡터의 덧셈, 뺄셈, 스칼라배',
    materialIds: ['mat7'],
  },
  {
    id: 'ip6-1',
    subject: '수학',
    subCategory: '확률과 통계',
    label: '모의고사',
    description: 'Mock Exam 문제풀이',
    materialIds: ['mat6'],
  },
  {
    id: 'ip6-2',
    subject: '수학',
    subCategory: '수학1',
    label: '플래너 업로드',
    description: '학습 플래너 기반 과제',
    materialIds: ['mat6'],
  },
];

export const MOCK_LEARNING_MATERIALS: LearningMaterial[] = [
  // 설스터디 기본 학습지
  {
    id: 'mat1',
    title: '2025 수능특강 비문학.pdf',
    fileSize: '2.4 MB',
    improvementPointId: 'ip1',
    subject: '국어',
    source: 'seolstudy',
    url: '/materials/korean/2025-수능특강-비문학.pdf',
  },
  {
    id: 'mat2',
    title: '문학 감상문 작성법.pdf',
    fileSize: '1.2 MB',
    improvementPointId: 'ip2',
    subject: '국어',
    source: 'seolstudy',
    url: '/materials/korean/문학-감상문-작성법.pdf',
  },
  {
    id: 'mat3',
    title: '2025 수능특강 영어독해.pdf',
    fileSize: '2.4 MB',
    improvementPointId: 'ip3',
    subject: '영어',
    source: 'seolstudy',
    url: '/materials/english/2025-수능특강-영어독해.pdf',
  },
  {
    id: 'mat4',
    title: '영어 독해 학습 가이드.pdf',
    fileSize: '0.8 MB',
    improvementPointId: 'ip3',
    subject: '영어',
    source: 'seolstudy',
    url: '/materials/english/영어-독해-학습-가이드.pdf',
  },
  {
    id: 'mat5',
    title: '수능 필수 영단어 50.pdf',
    fileSize: '0.5 MB',
    improvementPointId: 'ip4',
    subject: '영어',
    source: 'seolstudy',
    url: '/materials/english/수능-필수-영단어-50.pdf',
  },
  {
    id: 'mat6',
    title: 'EBS 수능완성 수학.pdf',
    fileSize: '3.1 MB',
    improvementPointId: 'ip5',
    subject: '수학',
    source: 'seolstudy',
    url: '/materials/math/EBS-수능완성-수학.pdf',
  },
  {
    id: 'mat7',
    title: '기하 벡터 연습문제.pdf',
    fileSize: '1.5 MB',
    improvementPointId: 'ip6',
    subject: '수학',
    source: 'seolstudy',
    url: '/materials/math/기하-벡터-연습문제.pdf',
  },
];

export const MOCK_DRAFT_ASSIGNMENTS: DraftAssignment[] = [
  {
    id: 'draft1',
    menteeId: 's1',
    menteeName: '박지민',
    title: '2월 15일 수학 미적분 학습',
    subject: '수학',
    savedAt: '2026.02.04 14:30',
    formData: {},
  },
  {
    id: 'draft2',
    menteeId: 's1',
    menteeName: '박지민',
    title: '영어 독해 2지문',
    subject: '영어',
    savedAt: '2026.02.03 09:15',
    formData: {},
  },
  {
    id: 'draft3',
    menteeId: 's2',
    menteeName: '이서연',
    title: '물리 실험 보고서',
    subject: '과학',
    savedAt: '2026.02.02 22:00',
    formData: {},
  },
];

/** 과제 등록 폼 데이터 */
export interface AssignmentFormData {
  menteeId: string;
  dateMode: 'single' | 'recurring';
  singleDate?: string;
  recurringStartDate?: string;
  recurringEndDate?: string;
  recurringDays?: number[];
  recurringEndTime?: string;
  title: string;
  goal: string;
  subject: '국어' | '영어' | '수학';
  subjectSubCategory?: string;
  improvementPointId?: string;
  deadline?: string;
  deadlineTime?: string;
  columnContent: string;
  materialIds: string[];
  uploadedFileIds: string[];
}

/** 과목별 세부 카테고리 */
export const SUBJECT_SUBCATEGORIES: Record<string, string[]> = {
  국어: ['비문학', '문학', '문법', '화법과 작문'],
  영어: ['독해/듣기/어휘', '문법', '쓰기'],
  수학: ['미적분', '기하', '확률과 통계', '수학1', '수학2'],
  과학: ['물리', '화학', '생명과학', '지구과학'],
  사회: ['한국사', '세계사', '지리', '윤리와 사상', '정치와 법', '경제'],
};

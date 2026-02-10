# 멘티 서비스 UI/UX 디자인 리뷰 및 개선 제안

> 대상: 멘티(학생) | 목적: 학습 일정 관리, 멘토 피드백 확인, 알림 확인  
> 톤: 딱딱하지 않고, 신뢰감 있으면서 친근한 느낌

---

## 1. 타임테이블 색상 구성

### 1.1 문제 원인 분석 (UX/UI 관점)

| 원인 | 설명 |
|------|------|
| **시각적 경계 침범** | 블록에 `shadow-soft` + `ring-1 ring-white/30`가 적용되어 있어, 셀 테두리 바깥으로 그림자·링이 퍼져 보임. 특히 `mx-[2px] my-[2px]` 마진과 함께 쓰이면 그리드 라인과 블록 경계가 분리되어, 색이 칸을 넘어가는 듯한 느낌을 줌 |
| **그라데이션 채도** | 기본 팔레트 `default`가 hsl(193 87% 45%) 등 고채도 그라데이션 사용. `story`(기본 선택)도 #A8C0FF~#FFB6C1 등 파스텔이지만 색상 대비가 커서 눈에 튀는 편 |
| **60칸 그리드** | 시간당 60분 → 1칸당 매우 좁음. 좁은 칸에 그라데이션+그림자가 들어가면 경계가 흐려지고, 과하게 튀어 보임 |
| **색상 조화 부족** | 팔레트 내 색들이 서로 다른 hue(파랑·보라·초록·주황·핑크)를 섞어 쓰므로, 인접 블록과 충돌할 때 “조화롭지 않다”는 인상이 듦 |

### 1.2 개선 방향

**A. 블록 경계 명확화**
- `ring` 제거 또는 `ring-inset`으로 내부에만 적용
- `shadow-soft` → `shadow-sm` 또는 `0 1px 2px rgba(0,0,0,0.04)`처럼 더 약한 그림자
- 블록에 `overflow-hidden` 적용해 그라데이션이 셀 밖으로 확장되지 않도록

**B. 색상 팔레트 예시 (저채도·조화)**

```ts
// timetableColorStorage.ts - 개선 예시
softMint: {
  name: '소프트 민트',
  colors: [
    'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',  // 연한 그린
    'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',  // 연한 블루
    'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',   // 연한 오렌지
    'linear-gradient(135deg, #FCE4EC 0%, #F8BBD9 100%)',  // 연한 핑크
    'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',   // 연한 퍼플
    'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',  // 연한 시안
  ],
},
mono: {
  name: '모노톤',
  colors: [
    'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)',
    'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
    'linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 100%)',
    'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)',
    'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%)',
  ],
},
```

**C. GENZ_INSTAGRAM_UI_SPEC 반영**
- “비비드 그라데이션 → 스토리/하이라이트 톤, 저채도” 권장사항에 맞춰 위 팔레트를 기본으로 사용

---

## 2. 피드백 과목 영역

### 2.1 현재 구조의 한계

- `FeedbackSummarySection`: 멘토명·시간·메시지만 표시, **과목 정보 없음**
- `FeedbackCard`: 과목 아이콘·라벨은 있으나, **피드백 상태·요약** 등이 추상적
- “과목별 피드백”이라는 개념이 한눈에 들어오지 않음

### 2.2 피드백 과목용 목업 데이터 구조 제안

```ts
// src/data/feedbackSubjectMock.ts

export type FeedbackSubjectStatus = 
  | 'NEW'        // 새 피드백 있음
  | 'READ'       // 읽음
  | 'NO_FEEDBACK'; // 해당 날짜 피드백 없음

export type FeedbackSubjectItem = {
  id: string;
  subject: 'KOREAN' | 'ENGLISH' | 'MATH' | 'ETC';
  subjectLabel: string;
  mentorName: string;
  mentorAvatar?: string;
  status: FeedbackSubjectStatus;
  feedbackSummary: string;     // 1~2줄 요약
  feedbackFull?: string;       // 전체 내용
  timeText: string;            // "2시간 전", "14:30"
  assignmentCount: number;
  assignmentIds: string[];
  assignmentTitles?: string[];  // "수학 - 적분", "수학 - 미분" 등
};

export const MOCK_FEEDBACK_BY_SUBJECT: Record<string, FeedbackSubjectItem[]> = {
  '2026-02-06': [
    {
      id: 'fb-math-1',
      subject: 'MATH',
      subjectLabel: '수학',
      mentorName: '김민준',
      mentorAvatar: undefined,
      status: 'NEW',
      feedbackSummary: '적분 문제 치환적분 활용 좋아요. 부호 실수만 줄이면 더 좋겠어요.',
      feedbackFull: '오늘 풀이한 적분 문제에서 치환적분 활용이 정말 좋았습니다!\n다만 부호 실수가 2문제에서 보였어요.\n검산 습관을 들이면 충분히 줄일 수 있을 것 같아요.',
      timeText: '14:30',
      assignmentCount: 3,
      assignmentIds: ['a-101', 'a-102', 'a-103'],
      assignmentTitles: ['적분 기본', '치환적분', '부분적분'],
    },
    {
      id: 'fb-kor-1',
      subject: 'KOREAN',
      subjectLabel: '국어',
      mentorName: '김민준',
      status: 'READ',
      feedbackSummary: '시 감상에서 화자 정서 파악 좋았어요. 상징어 해석도 전반적으로 우수합니다.',
      timeText: '13:10',
      assignmentCount: 2,
      assignmentIds: ['a-102', 'a-104'],
      assignmentTitles: ['고전시가 감상', '현대시 분석'],
    },
  ],
  '2026-02-07': [
    {
      id: 'fb-eng-1',
      subject: 'ENGLISH',
      subjectLabel: '영어',
      mentorName: '김민준',
      status: 'NEW',
      feedbackSummary: '문단별 요약 좋아요. 근거 문장 표시를 한 번 더 해보면 정확도가 올라갑니다.',
      timeText: '11:05',
      assignmentCount: 1,
      assignmentIds: ['a-201'],
      assignmentTitles: ['독해 - 주제문 찾기'],
    },
  ],
};
```

### 2.3 UI 표시 개선 포인트

| 요소 | 현재 | 개선 |
|------|------|------|
| 과목 헤더 | 국어/영어/수학 아이콘만 | **과목명 + 상태 배지**(NEW/READ) + 과제 수 |
| 피드백 요약 | 본문 전체 또는 일부 | **1~2줄 요약** + "더 보기" |
| 과제 연결 | "과제 N개" | **과제 제목 리스트** 또는 "N개 과제 보기" 클릭 시 펼침 |

---

## 3. /mentee/notifications 페이지

### 3.1 현재 한계

- 단순 리스트 형태, 카드감 부족
- 모든 알림이 동일한 레이아웃 → **타입별 차별화 없음**
- 시각적 포인트(강조, 리듬) 부족
- 서비스 감성·리듬감 미흡

### 3.2 개선 아이디어

| 영역 | 제안 |
|------|------|
| **레이아웃** | `space-y-3` 대신 **섹션 구분**: "오늘", "어제", "이번 주" 등 시간 그룹별 헤더 추가 |
| **카드화** | 카드에 `rounded-2xl`, `shadow-sm` → `hover:shadow-md`로 카드감 강화. 읽지 않은 카드는 좌측 **색상 바**(border-l-4)로 강조 |
| **타입별 차별화** | `feedback` → 파란 계열, `reminder` → 오렌지/로즈, `system` → 회색. 아이콘 배경색뿐 아니라 **카드 전체 톤**을 미세하게 구분 |
| **시각적 포인트** | 읽지 않은 알림에 **작은 뱃지**(NEW) 또는 **펄스 애니메이션** 적용. 빈 상태일 때 일러스트·멘트로 친근함 부여 |
| **리듬감** | 알림 카드에 `stagger` 애니메이션(순차적으로 fade-in-up) 적용해 스크롤 시 자연스러운 흐름 느끼게 함 |

### 3.3 예시 레이아웃 스케치

```
┌─────────────────────────────────────┐
│  알림                    [모두 읽음] │
├─────────────────────────────────────┤
│  오늘                                │
│  ┌───────────────────────────────┐  │
│  │ 💬  새 피드백 도착         NEW │  │  ← border-l-4 blue
│  │     김민준 멘토님이 [영어...]   │  │
│  │                      방금 전   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ ⏰  미완료 과제 알림       NEW │  │  ← border-l-4 rose
│  │     [국어 - 고전시가] 제출...   │  │
│  │                      1일 전   │  │
│  └───────────────────────────────┘  │
│  어제                                │
│  ┌───────────────────────────────┐  │
│  │ 💬  새 피드백 도착             │  │  ← 읽음: 회색 톤
│  │     ...                        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 4. /mentee/mypage 페이지

### 4.1 현재 상태

- **프로필**: 이름, 아바타
- **학습 현황**: 주간 진행률, 총 학습시간, 완료 수
- **명언 카드**: 매일 바뀌는 멘트
- **과목별 달성률**: 국어/영어/수학 퍼센트
- **월별 학습 달력**: 출석/공부 시간
- **배지**: 획득한 배지 목록
- **로그아웃**
- **상담 버튼**

→ 프로필, 학습 통계, 동기부여, 게임화(배지), 설정(로그아웃)이 섞여 있어 **목적이 모호**함.

### 4.2 멘티 기준 마이페이지 핵심 역할 정의

| 역할 | 설명 | 우선순위 |
|------|------|----------|
| **나의 학습 요약** | 지금까지 얼마나 했는지, 이번 주/이번 달 흐름 | ⭐ 핵심 |
| **진행 상황 확인** | 과목별 달성률, 목표 대비 진행 | ⭐ 핵심 |
| **동기부여** | 명언, 배지, 스트릭 등 | ⭐ 보조 |
| **프로필/설정** | 이름, 아바타, 로그아웃, 상담 요청 | ⭐ 보조 |

**핵심 가치**: “내가 얼마나 잘하고 있는지” 한눈에 보기 + “조금 더 해보고 싶다”는 동기 유발

### 4.3 IA 구조 제안

```
마이페이지
├── [1] 프로필 (필수)
│   ├── 아바타, 이름
│   └── (선택) 프로필 수정 진입점
│
├── [2] 학습 요약 (필수)
│   ├── 이번 주 진행률 (WeeklyStudyStatusCard)
│   └── 명언/멘트 (동기부여용, 유지 권장)
│
├── [3] 과목별 달성률 (필수)
│   └── SubjectAchievementSection
│
├── [4] 학습 달력 (권장)
│   └── MonthlyStudyCalendar (오늘 이전만 표시)
│
├── [5] 배지 (권장)
│   └── BadgeSection
│
└── [6] 설정/기타 (필수)
    ├── 로그아웃
    └── 상담 요청 (ConsultButton)
```

### 4.4 빼도 되는 / 조정 가능한 정보

| 항목 | 판단 | 이유 |
|------|------|------|
| 명언 카드 | 유지 | 동기부여, 감성 톤에 부합 |
| 과목별 달성률 | 유지 | 핵심 목표. 다만 링 차트/카드 등 표현 방식 개선 권장 |
| 월별 달력 | 유지 | 학습 패턴 파악에 유용. 미래 날짜 제거는 명세 반영 |
| 배지 | 유지 | 게임화, 재방문 동기 |
| 프로필 수정 | 선택 | 멘티 앱에서 필수는 아님. 있으면 좋은 수준 |
| 상담 버튼 | 유지 | 지원 요청 경로로 중요 |

**정리**: 구조 자체는 유지하되, **프로필 → 학습 요약 → 과목/달력/배지 → 설정** 순서로 정보 위계를 명확히 하고, “학습 요약”이 메인 메시지가 되도록 시각적 위계를 조정하는 것이 좋음.

---

## 5. 홈페이지 상단 UI 정렬 (코멘트 버튼)

### 5.1 어색해 보이는 이유

```tsx
// MenteeMainPage.tsx 164~196행
<div className="flex items-center justify-between">
  <div className="flex items-center gap-1">
    <span className="text-lg font-semibold text-gray-900">{menteeName}님</span>
  </div>
  <div className="flex items-center gap-2">
    <button ... className="grid h-10 w-10 place-items-center rounded-full ...">
      <DmIcon className="h-5 w-5" />
    </button>
    ...
    <button ... className="grid h-10 w-10 place-items-center ...">
      <UserIcon className="h-5 w-5" />
    </button>
  </div>
</div>
```

| 원인 | 설명 |
|------|------|
| **비대칭 구조** | 왼쪽: 텍스트(`{menteeName}님`). 오른쪽: **버튼 2개**. 시각적 무게가 오른쪽에 쏠려, 전체 헤더가 오른쪽으로 기울어 보일 수 있음 |
| **버튼 2개의 무게** | 코멘트(DmIcon) + 프로필(UserIcon)이 동일 크기(40px)로 나란히 있어, “한쪽이 가운데”가 아니라 “둘 다 오른쪽”으로 인식됨. 사용자가 “코멘트 버튼이 가운데”라고 느끼려 한 것은, 아마 **전체 화면의 시각적 중심**을 기대했을 가능성이 큼 |
| **아이콘 시각적 무게** | DmIcon(종이비행기)과 UserIcon(사람)은 형태가 달라 시각적 무게가 다름. `h-5 w-5`로 동일해도, 비대칭 아이콘은 **optical center**가 다르게 느껴질 수 있음 |
| **여백 불균형** | `justify-between`으로 좌우 끝에 배치되므로, “가운데”에 오는 요소가 없음. 상단 전체가 좌-우로 갈라져 보임 |

### 5.2 시각적 중심 맞추는 방법

| 방법 | 적용 |
|------|------|
| **헤더 3분할** | `grid grid-cols-3`로 좌(버튼1) | 중(제목) | 우(버튼2) 배치. 제목을 진짜 가운데에 두면 코멘트 버튼도 “중앙 왼쪽”으로 인식되어 균형이 맞음 |
| **좌우 대칭** | 왼쪽에 뒤로가기(또는 빈 공간), 오른쪽에 버튼 2개 → 대칭이 되어 보기 좋음. 또는 **좌우에 1개씩** 버튼 배치 (예: 왼쪽 알림, 오른쪽 프로필) |
| **아이콘 크기 통일** | `h-5 w-5` 유지하되, `viewBox`가 다른 아이콘은 **padding으로 보정** (예: `p-2`로 감싸서 실제 터치 영역은 40px 유지) |
| **flex-1로 균형** | 좌측 `flex-1 text-left`, 중앙 `flex-none`, 우측 `flex-1 flex justify-end`로 해서, 텍스트가 짧을 때도 중앙이 비주얼 중심으로 유지되게 함 |

### 5.3 권장 레이아웃 코드 예시

```tsx
// 3분할: [뒤로/빈칸] | [제목] | [버튼들]
<div className="grid grid-cols-3 items-center gap-2">
  <div className="flex justify-start">
    {/* 빈 공간 또는 뒤로가기 */}
  </div>
  <h1 className="text-center text-lg font-semibold text-gray-900 truncate">
    {menteeName}님
  </h1>
  <div className="flex justify-end gap-2">
    <button ...><DmIcon className="h-5 w-5" /></button>
    <button ...><UserIcon className="h-5 w-5" /></button>
  </div>
</div>
```

이렇게 하면 제목이 화면 중앙에 오고, 버튼들은 오른쪽에 명확히 정렬되어 “가운데가 아니다”는 인상이 줄어듦.

---

## 참고: 적용 우선순위

| 순위 | 항목 | 영향도 | 난이도 |
|------|------|--------|--------|
| 1 | 타임테이블 색상/경계 | 높음 | 중 |
| 2 | 홈 상단 정렬 | 중 | 낮음 |
| 3 | 피드백 과목 목업/구조 | 높음 | 중 |
| 4 | 알림 페이지 개선 | 중 | 중 |
| 5 | 마이페이지 IA 정리 | 중 | 낮음 |

---

*작성: 멘티 UI 디자인 리뷰 v1.0*

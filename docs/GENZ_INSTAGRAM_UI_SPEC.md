# Gen Z / 인스타그램 스타일 UI 명세

> 10~20대 학생 대상, "매일 들어오고 싶은 앱"

---

## 1. 인스타그램 스타일 UI 개선 방향

### 1.1 감성 키워드
- **미니멀**: 불필요한 테두리·라벨 제거
- **여백 위주**: 컴포넌트 간 breathing room
- **부드러운 색**: 고채도 대비 → 저채도 파스텔/무채색
- **일관된 톤**: 인스타그램 스토리/하이라이트 느낌

### 1.2 제거할 요소
- 과한 둥근 모서리 (rounded-3xl 등)
- 강한 테두리 (border-gray-200)
- 상세보기 버튼 (카드 전체 클릭으로 대체)
- 과한 그라데이션·채도

### 1.3 추가할 요소
- DM 아이콘 (인스타그램 Paper plane ↔ 유사 형태)
- 인스타그램 댓글 구조 (프로필 원형 + 닉네임 + 내용 + 답글 들여쓰기)
- 스토리 톤 팔레트 (부드러운 그라데이션)
- 링 차트 / 카드 기반 달성률

---

## 2. 페이지별 UI/UX 수정 포인트

### [홈 페이지]

| 영역 | 현재 | 개선 |
|------|------|------|
| 헤더 채팅 아이콘 | 일반 말풍선 | 인스타그램 DM(Paper plane) 형태 |
| 코멘트 모달 | 일반 폼 | 인스타 인피드 댓글 구조 (프로필 원형, 들여쓰기 답글) |
| 달력 | border, rounded-2xl, 과한 셀 | 테두리 최소화, 간격 정돈, 인스타 캘린더 톤 |
| 타임테이블 | 비비드 그라데이션 | 스토리/하이라이트 톤, 저채도 |

### [과제 페이지]

| 영역 | 현재 | 개선 |
|------|------|------|
| 카드 | 상세보기 버튼 | **카드 전체 클릭** → 상세 이동 |
| 카드 스타일 | 올드한 border·shadow | 여백·그림자·텍스트 위계 정리 |

### [피드백 페이지]

| 영역 | 현재 | 개선 |
|------|------|------|
| 과목 필터 버튼 | 전체/국어/영어/수학 고정 | **피드백 없는 과목 버튼 미렌더링** |
| 버튼 스타일 | 이중 정의 | 과제 페이지와 **동일 규격** |
| 피드백 카드 | 카드형, 테두리 | **인스타 댓글 구조**: 과목명=유저명, 요약=본문, 날짜=보조텍스트 |

### [알림 페이지]

| 영역 | 개선 |
|------|------|
| 리스트 | 프로필 이미지 + 텍스트 중심, 테두리 없음 |
| 타이포 위계 | 이름(볼드) → 내용 → 시간(뮤트) |
| 색상 | 불필요한 색 제거, 회색 계열 |

### [마이페이지]

| 영역 | 현재 | 개선 |
|------|------|------|
| 구조 | 통계 중심 | **프로필 중심**, 개인 기록 요약 |
| 과목 달성률 | 퍼센트 + 막대바 | **링 차트 / 카드 / 아이콘** 등 직관적 표현 |
| 달력 | 미래 날짜에도 공부 시간 | **오늘 이전만** 공부 시간 표시 |

---

## 3. 공통 컴포넌트 디자인 규칙

### 3.1 버튼 (필터/탭 토글)

```
크기: h-9 (36px), px-4, py-2
radius: rounded-full
font: text-sm font-semibold

선택됨: bg-gray-900 text-white (또는 brand 단색)
비선택: bg-white border border-gray-200 text-gray-600
hover: hover:bg-gray-50
```

### 3.2 카드

```
padding: p-4 (16px)
radius: rounded-xl (12px)
border: border 없음 또는 border-gray-100
shadow: shadow-sm
hover: hover:shadow-md (클릭 가능 시)
```

### 3.3 헤더

```
height: h-14
padding: px-4
아이콘: h-10 w-10 (40px)
```

### 3.4 간격 체계 (8px 베이스)

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

---

## 4. 프론트엔드 구현 조건 로직

### 4.1 과목 필터 버튼 렌더 조건

```ts
// 피드백이 있는 과목만 버튼 표시
const subjectsWithFeedback = useMemo(() => {
  const hasAll = feedbacks.length > 0;
  const hasKorean = feedbacks.some(f => f.subject === 'KOREAN');
  const hasEnglish = feedbacks.some(f => f.subject === 'ENGLISH');
  const hasMath = feedbacks.some(f => f.subject === 'MATH');
  return [
    hasAll && { label: '전체', value: 'ALL' },
    hasKorean && { label: '국어', value: 'KOREAN' },
    hasEnglish && { label: '영어', value: 'ENGLISH' },
    hasMath && { label: '수학', value: 'MATH' },
  ].filter(Boolean);
}, [feedbacks]);
```

### 4.2 마이페이지 달력 - 미래 날짜 처리

```ts
// 오늘 이전 날짜만 study hours 표시
const displayHours = useMemo(() => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return (date: Date, hours: number) => {
    if (date > today) return undefined; // 미래 = 표시 안 함
    return hours;
  };
}, []);
```

### 4.3 과제 카드 클릭

- `button` 또는 `div`에 `onClick` → `navigate(assignmentId)`
- 상세보기 버튼 제거
- `cursor-pointer` 적용

---

*작성: Gen Z / 인스타그램 스타일 UI 명세 v1.0*

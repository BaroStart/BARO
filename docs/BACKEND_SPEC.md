# 백엔드 API 명세 (`/api/v1` + `/mentor`)

이 문서는 프론트가 사용하는 API를 2개 그룹으로 정리합니다.
- **`/api/v1`**: Swagger(`/v3/api-docs`) v0.0.1에 정의된 API (응답이 `ApiResponse<T>` Envelope 형태)
- **`/mentor`**: 현재 프론트 멘토 화면이 의존하는 “서비스 API” (응답이 **Envelope 없이** JSON 객체/배열)

- **Swagger**: `GET https://158.180.75.132.nip.io/v3/api-docs`
- **Base URL**: `https://158.180.75.132.nip.io`
- **프론트 API 구현 위치**: `src/api/*.ts`

---

## 환경 설정 (프론트)

| 환경 변수 | 설명 | 권장(개발) | 권장(배포) |
|---|---|---:|---:|
| `VITE_USE_MOCK` | `false`면 실제 백엔드 호출 | `false` | `false` |
| `VITE_API_URL` | 백엔드 URL (개발: 프록시 대상 / 배포: axios baseURL) | `https://158.180.75.132.nip.io` | `https://158.180.75.132.nip.io` |

### 개발(CORS 우회) 권장 설정
- 브라우저 CORS를 피하려면 **프론트는 `/api/...`로 호출**하고, Vite가 백엔드로 프록시하도록 설정합니다.
- 개발 환경에서는 `config.ts`가 자동으로 axios baseURL을 비워서 프록시를 타게 합니다.

---

## 공통 응답 포맷 (Envelope)

대부분의 응답은 아래 형태입니다.

```ts
type ApiResponse<T> = {
  status: number;   // 예: 0 또는 200/201 등 (서버 구현에 따라 다를 수 있음)
  code: string;     // 예: "OK"
  message: string;
  result: T;
};
```

### 성공 판정(프론트 기준)
프론트는 다음 중 하나면 성공으로 처리합니다.
- `code === "OK"`
- 또는 `status === 0`
- 또는 `status`가 2xx (`200~299`)

관련 코드: `src/api/response.ts` (`isApiSuccess`)

---

## 인증 (JWT)

- **Authorization 헤더**: `Authorization: Bearer {accessToken}`
- axios 자동 첨부: `src/api/axiosInstance.ts`
- 401이면 `GET /api/v1/refresh?token=...`로 갱신 시도 후 **원요청 1회 재시도**

### 실서버 동작 확인 (2026-02-06, curl 기준)

아래는 `Base URL: https://158.180.75.132.nip.io`에 대해 **JWT 로그인 → 각 API 호출**을 실제로 수행했을 때의 결과 요약입니다.

| API | 결과(HTTP) | 요약 |
|---|---:|---|
| `POST /api/v1/login` | 200 | access/refresh 토큰 발급 **성공** |
| `GET /api/v1/examples` | 201 | 목록 조회 **성공** (일반적으로 조회는 200이 더 자연스러움) |
| `GET /api/v1/todos` | 200 | 오늘 할 일 조회 **성공** |
| `POST /api/v1/todos` | 500 | 할 일 생성 **실패** (서버 내부 오류) |
| `POST /api/v1/storages/pre-authenticated-url?fileName=...` | 201 | 업로드 URL 발급 **성공** |
| `GET /api/v1/mentee/1` | 404 | `USER_NOT_FOUND` (해당 ID 유저 없음/접근 불가) |
| `GET /mentor/mentees` | 403 | **권한 거부** (응답에 `Set-Cookie: JSESSIONID=...` 관찰) |
| `GET /mentor/assignments/submitted` | 403 | **권한 거부** (동일) |
| `GET /api/v1/refresh?token=...` | 200 | 토큰 갱신 **성공** (새 토큰쌍 반환) |
| `GET /api/v1/logout` | 200 | 로그아웃 **성공** |

#### 해석 / 체크포인트

- **인증 자체는 정상**: `/api/v1/login`, `/api/v1/refresh`, `/api/v1/logout`가 동작하므로 JWT 발급/갱신 플로우는 살아있습니다.
- **`POST /api/v1/todos`의 500은 백엔드 이슈 가능성 큼**:
  - 명세상 요청 바디는 `{ "title": string }`면 충분해야 하는데도 500이므로, 서버의 DB/Validation/NPE 등 내부 에러일 수 있습니다.
  - 정상이라면 보통 잘못된 요청은 400/422로 내려오는 편입니다.
- **`/mentor/...`는 현재 서버에서 Bearer 인증으로 접근 불가(403)**:
  - 403과 함께 `JSESSIONID`가 내려오는 것은, 해당 라우트가 **세션 기반 보안 설정** 또는 **다른 인증 체계**를 타고 있을 가능성을 시사합니다.
  - 이 문서의 “멘토 서비스 API” 섹션은 `Authorization: Bearer ...`를 전제로 작성되어 있으므로, 백엔드 구현/보안 설정과의 정합성 점검이 필요합니다.

---

## Auth API

### POST `/api/v1/signup` 회원가입

**Request (JSON)**

```json
{
  "loginId": "baro1234",
  "password": "1234",
  "name": "baro",
  "nickname": "baro1234",
  "joinType": "MENTOR",
  "grade": "FIRST",
  "school": "NORMAL",
  "hopeMajor": "medical",
  "university": "서울대"
}
```

> 참고(실서버 경험): `university` 누락/빈 값일 때 서버가 `"혹시 닉네임을 중복해서 요청하시진 않으셨나요?"`처럼 **원인과 무관한 메시지**를 주는 경우가 있었습니다.  
> 프론트에서는 혼란을 줄이기 위해 `university`를 필수 입력으로 처리하는 것을 권장합니다.

**Response**
- `ApiResponse<string>` (예: `"회원가입 되었습니다."`)

프론트 구현: `src/api/auth.ts`, 화면: `src/pages/SignupPage.tsx`

### POST `/api/v1/login` 로그인

**Request (JSON)**

```json
{ "loginId": "baro1234", "password": "1234" }
```

**Response**

```ts
ApiResponse<{
  accessToken: string;
  refreshToken: string;
  userId?: number;   // 선택. 없으면 loginId로 대체
  name?: string;    // 선택. 표시 이름
  role?: string;    // 권장. "mentor" | "mentee" — 있으면 프론트에서 멘티↔멘토 교차 로그인 차단
  userType?: string; // role과 동일 의미로 사용 가능
}>
```

- **역할 검사**: 응답에 `role` 또는 `userType`이 있으면, 로그인 화면에서 선택한 역할(멘토/멘티)과 일치할 때만 로그인 성공 처리. 불일치 시 "멘티 계정으로는 멘토 로그인을 할 수 없습니다" 등 안내.

프론트 구현: `src/api/auth.ts`, 상태 저장: `src/stores/useAuthStore.ts`

### GET `/api/v1/refresh?token=...` 토큰 갱신

**Query**
- `token` (string, required): refresh token

**Response**: 로그인과 동일한 토큰쌍 반환

### GET `/api/v1/logout` 로그아웃
- 성공 시 `ApiResponse<string>`
- 프론트는 호출 실패해도 로컬 로그아웃 진행

---

## ToDo API (할 일)

### 스키마

```ts
type TimeSlot = { startTime: string; endTime: string }; // ISO date-time
type ToDoStatus = "COMPLETED" | "NOT_COMPLETED";

type ToDoRes = {
  // Swagger 스키마엔 id가 없지만,
  // 프론트에서 수정/삭제를 하려면 id가 반드시 필요합니다.
  id?: number;
  title: string;
  status: ToDoStatus;
  timeList?: TimeSlot[];
};
```

### GET `/api/v1/todos` 오늘의 할 일 조회
- Response: `ApiResponse<ToDoRes[]>`

### POST `/api/v1/todos` 할 일 생성

**Request**

```json
{ "title": "국어 문제 풀기" }
```

### PUT `/api/v1/todos` 할 일 수정

**Request**

```json
{
  "id": 1,
  "title": "국어 문제 풀기",
  "timeList": [
    { "startTime": "2026-02-05T10:00:00", "endTime": "2026-02-05T11:00:00" }
  ]
}
```

### PATCH `/api/v1/todos/{id}/status` 상태 변경

**Request**

```json
{
  "id": 1,
  "status": "COMPLETED",
  "timeList": [
    { "startTime": "2026-02-05T10:00:00", "endTime": "2026-02-05T11:00:00" }
  ]
}
```

### DELETE `/api/v1/todos/{id}` 할 일 삭제

프론트 구현: `src/api/todos.ts`, 연결: `src/stores/useTodoStore.ts`

---

## Object Storage API

### POST `/api/v1/storages/pre-authenticated-url?fileName=...`
- Query: `fileName` (required) 예: `profile/{username}.jpg`
- Response: `ApiResponse<{ url: string }>`

### 파일 업로드 (PUT)
발급된 `url`로 **브라우저에서 PUT 업로드**합니다. (JSON 아님)

프론트 구현: `src/api/storages.ts`, 업로드 유틸: `src/lib/storageUpload.ts`

---

## Mentee API

### GET `/api/v1/mentee/{menteeId}` 멘티 정보 조회
- `menteeId`: int64
- Response:

```ts
ApiResponse<{
  menteeName: string;
  menteeGrade: string;
  lastAccess: number;
  mentoringStartDate: string;
  totalStudyTime: number;
  assignmentAchieveRate: number;
  averageScore: number;
}>
```

프론트 구현: `src/api/menteeV1.ts` (멘토 멘티 상세 헤더에 매핑: `src/pages/mentor/MenteeDetailPage.tsx`)

### POST `/api/v1/mentee/activity` 멘티 접속 시각 기록 (마지막 접속 갱신)

- **목적**: 멘티가 앱에 접속했을 때 서버에 접속 시각을 기록하여, 멘토 화면 "마지막 접속"에 실제 시간이 표시되도록 함.
- **인증**: `Authorization: Bearer {accessToken}` (멘티 로그인 사용자)
- **요청**: Body 없음 또는 `{}`
- **응답**: `ApiResponse<Unit>` 또는 200 OK
- **백엔드 권장 동작**: JWT에서 멘티 사용자 ID를 식별한 뒤, 해당 사용자의 `last_access`(또는 동일 의미 필드)를 현재 시각(Unix ms 또는 적절한 타임스탬프)으로 DB에 갱신. 이후 `GET /api/v1/mentee/{menteeId}` 및 멘토 대시보드 응답의 `lastAccess`에 이 값이 포함되면 프론트에서 "마지막 접속: YYYY. M. D. ..." 형태로 표시함.

프론트 구현: `src/api/menteeActivity.ts` (멘티 레이아웃 마운트 시 1회 호출: `src/components/layouts/MenteeLayout.tsx`)

---

## Example API

### GET `/api/v1/examples`
- Response: `ApiResponse<{ name: string }[]>`

### GET `/api/v1/examples/{id}`
- Response: `ApiResponse<{ name: string }>`

프론트 구현: `src/api/examples.ts`

---

## 멘토 서비스 API (`/mentor/...`) — 프론트 “전체 기능” 필수

> 중요: 현재 프론트의 **멘토 화면 대부분은 `/mentor/...` API를 호출**합니다.  
> 따라서 백엔드가 이 API들을 구현하지 않으면, 멘토 화면(대시보드/멘티 상세/피드백 작성/과제 등록 등)이 동작하지 않습니다.
>
> 이 섹션의 응답은 프론트 코드 기준으로 **Envelope 없이 “바로 JSON 객체/배열”**을 반환해야 합니다.

### 화면 매핑(프론트 기준)
- **멘토 메인 대시보드**: `GET /mentor/mentees`, `GET /mentor/assignments/submitted`
- **멘티 상세 페이지**: `GET /mentor/mentees/{menteeId}` + (탭별) `kpi / tasks / feedback / assignments/incomplete / comments/today`
- **학습 분석 모달**: `GET /mentor/mentees/{menteeId}/learning/subject-times`, `GET /mentor/mentees/{menteeId}/learning/weekly-patterns`
- **과제 상세 모달**: `GET /mentor/mentees/{menteeId}/assignments/{assignmentId}`
- **피드백 작성 모달/페이지**: `GET/POST /mentor/mentees/{menteeId}/assignments/{assignmentId}/feedback`
- **과제 등록 페이지**: `POST /mentor/mentees/{menteeId}/assignments`

### 공통
- **Auth**: `Authorization: Bearer {accessToken}` (JWT)
- **Content-Type**: `application/json`
- **Base URL**: (백엔드 환경에 맞게) 예: `https://api.example.com`
 - **날짜 포맷**: `YYYY-MM-DD` (예: `2026-02-06`)
 - **시간 포맷**: `HH:mm` (예: `23:59`)
 - **날짜/시간(ISO)**: `2026-02-06T09:10:00.000Z` 등

---

## 1) 멘티 (Mentees)

### GET `/mentor/mentees` 담당 멘티 목록

**Response (200)**

```json
[
  {
    "id": "s1",
    "name": "박지민",
    "school": "서울 소재 일반고",
    "grade": "고3",
    "gradeFull": "고등학교 3학년",
    "track": "이과",
    "progress": 85,
    "todaySubmitted": 2,
    "todayTotal": 3,
    "uncheckedCount": 1,
    "pendingFeedbackCount": 2,
    "learningCert": "1장",
    "learningCertUploaded": "오늘 업로드됨",
    "weeklyAchievement": 85,
    "weeklyChange": 12,
    "lastActive": "2시간 전",
    "mentoringStart": "2026년 1월 5일",
    "desiredMajor": "의학계열",
    "scores": {
      "naesin": { "korean": { "midterm1": 85 }, "english": { "midterm1": 90 } },
      "mockExam": { "korean": { "march": 82 }, "english": { "march": 88 } }
    },
    "memo": "학생 메모(선택)"
  }
]
```

### GET `/mentor/mentees/{menteeId}` 멘티 상세(요약)

**Response (200)**: `MenteeSummary` 1개(위와 동일 스키마)

---

## 2) 제출 과제 (Submitted Assignments)

### GET `/mentor/assignments/submitted` 제출 과제 전체

**Response (200)**

```json
[
  {
    "id": "a1",
    "menteeId": "s1",
    "title": "수학 문제풀이 3단원",
    "subject": "수학",
    "submittedAt": "2026.02.02 09:30",
    "feedbackDone": false,
    "iconType": "document"
  }
]
```

### GET `/mentor/mentees/{menteeId}/assignments/submitted` 멘티별 제출 과제

**Response (200)**: 위와 동일(배열)

---

## 3) 과제 등록 (Assignments Register)

### POST `/mentor/mentees/{menteeId}/assignments` 과제 등록

프론트 구현(`src/api/assignments.ts`) 기준 요청 스키마입니다.

#### Request: 단일 날짜

```json
{
  "menteeId": "s1",
  "dateMode": "single",
  "singleDate": "2026-02-15",
  "title": "2월 15일 수학 미적분 학습",
  "goal": "개념 정리 + 기본 문제 10개",
  "subject": "수학",
  "description": "과제 설명(선택)",
  "content": "<p>에디터 HTML(선택)</p>",
  "recurringEndTime": "23:59"
}
```

#### Request: 요일 반복

```json
{
  "menteeId": "s1",
  "dateMode": "recurring",
  "recurringDays": [1, 3, 5],
  "recurringStartDate": "2026-02-01",
  "recurringEndDate": "2026-02-28",
  "recurringEndTime": "23:59",
  "title": "영단어 누적 복습",
  "goal": "D+1/D+3/D+7 반복",
  "subject": "영어",
  "description": "과제 설명(선택)",
  "content": "<p>에디터 HTML(선택)</p>"
}
```

#### Response (200)

```json
{
  "success": true,
  "taskIds": ["t-1", "t-2"],
  "message": "선택(실패 시 사유)"
}
```

---

## 4) 멘티 상세 데이터 (Mentee Detail)

### GET `/mentor/mentees/{menteeId}/kpi` KPI 지표

**Response (200)**

```json
{
  "menteeId": "s1",
  "totalStudyHours": 24,
  "studyHoursChange": 2,
  "assignmentCompletionRate": 85,
  "completionRateChange": 5,
  "averageScore": 92,
  "scoreChange": 1,
  "attendanceRate": 95,
  "attendanceChange": 0
}
```

> 프론트는 `null`도 허용합니다. (`fetchMenteeKpi(): Promise<MenteeKpi | null>`)

### GET `/mentor/mentees/{menteeId}/tasks` 학습 일정/To-Do

**Query**
- `date` (optional, `YYYY-MM-DD`)
- `startDate` (optional, `YYYY-MM-DD`)
- `endDate` (optional, `YYYY-MM-DD`)

**Response (200)**

```json
[
  {
    "id": "t1",
    "menteeId": "s1",
    "date": "2026-02-06",
    "title": "영어 단어 암기",
    "subject": "영어",
    "completed": false,
    "completedAt": null,
    "estimatedMinutes": 30
  }
]
```

### GET `/mentor/mentees/{menteeId}/feedback` 피드백 목록

**Query**
- `subject` (optional) 예: `"국어" | "영어" | "수학" | "전체"`
- `startDate` (optional, `YYYY-MM-DD`)
- `endDate` (optional, `YYYY-MM-DD`)

**Response (200)**

```json
[
  {
    "id": "f1",
    "assignmentId": "a1",
    "menteeId": "s1",
    "title": "수학 문제풀이 3단원",
    "subject": "수학",
    "submittedAt": "2026.02.02 09:30",
    "status": "pending",
    "progress": 30,
    "lastUpdate": "2026.02.02 10:10",
    "feedbackText": null,
    "feedbackDate": null
  }
]
```

> `status` 값: `"urgent" | "pending" | "partial" | "completed"`

### GET `/mentor/mentees/{menteeId}/assignments/incomplete` 미완료 과제

**Query**
- `startDate` (optional, `YYYY-MM-DD`)
- `endDate` (optional, `YYYY-MM-DD`)

**Response (200)**

```json
[
  {
    "id": "ia1",
    "menteeId": "s1",
    "title": "영어 독해 2지문",
    "subject": "영어",
    "description": "오답 5개 정리",
    "content": "<p>과제 상세 HTML(선택)</p>",
    "deadline": "오후 11:59",
    "deadlineDate": "2026-02-06",
    "status": "not_started",
    "completedAt": null,
    "completedAtDate": null
  }
]
```

> `status` 값: `"completed" | "in_progress" | "not_started" | "deadline_soon"`

### GET `/mentor/mentees/{menteeId}/comments/today` 오늘의 한마디

**Response (200)**: 객체 또는 `null`

```json
{
  "id": "c1",
  "menteeId": "s1",
  "authorName": "박지민",
  "content": "오늘 집중이 잘 안돼요…",
  "createdAt": "2026-02-06T09:10:00.000Z",
  "date": "2026-02-06"
}
```

---

## 5) 학습 분석 (Learning Analysis)

### GET `/mentor/mentees/{menteeId}/learning/subject-times` 과목별 학습 시간

**Response (200)**

```json
[
  { "subject": "국어", "hours": 4.5 },
  { "subject": "영어", "hours": 3.0 },
  { "subject": "수학", "hours": 6.0 }
]
```

### GET `/mentor/mentees/{menteeId}/learning/weekly-patterns` 주간 학습 패턴

**Response (200)**

```json
[
  { "day": "월요일", "hours": 3, "filledBlocks": 6, "totalBlocks": 10 },
  { "day": "화요일", "hours": 4, "filledBlocks": 8, "totalBlocks": 10 }
]
```

---

## 6) 과제 상세 (Assignment Detail)

### GET `/mentor/mentees/{menteeId}/assignments/{assignmentId}` 과제 상세 조회

**Response (200)**: 객체 또는 `null`

```json
{
  "assignmentId": "a1",
  "title": "수학 문제풀이 3단원",
  "subject": "수학",
  "date": "2026-02-06",
  "goal": "개념 정리 + 기본 문제",
  "content": "<p>과제 내용 HTML</p>",
  "contentChecklist": ["개념 정리 1페이지", "기본 문제 10개", "오답 3개 정리"],
  "relatedResources": [{ "id": "r1", "name": "오답노트 양식" }],
  "studyColumn": { "title": "학습 팁", "content": "<p>칼럼 HTML</p>", "readMoreLink": "https://..." },
  "providedPdfs": [{ "id": "p1", "name": "학습지.pdf", "size": "2.4MB" }],
  "studentPhotos": [{ "id": "s1", "url": "https://...", "caption": "인증샷" }],
  "studentMemo": "학생 메모"
}
```

---

## 7) 피드백 (Feedback)

### GET `/mentor/mentees/{menteeId}/assignments/{assignmentId}/feedback` 피드백 조회

**Response (200)**: 객체 또는 `null`

```json
{
  "id": "fb1",
  "assignmentId": "a1",
  "menteeId": "s1",
  "feedbackText": "좋아요. 오답 정리가 더 필요합니다.",
  "status": "partial",
  "progress": 60,
  "feedbackDate": "2026-02-06",
  "lastUpdate": "2026-02-06 11:10"
}
```

### POST `/mentor/mentees/{menteeId}/assignments/{assignmentId}/feedback` 피드백 제출

**Request**

```json
{
  "feedbackText": "피드백 내용",
  "status": "partial",
  "progress": 60
}
```

> `status`는 `"partial" | "completed"`  
> `progress`는 `partial`일 때 0~100

**Response (200)**: 제출된 피드백 상세(위와 동일)


# API 레이어

백엔드 연동을 위한 API 서비스 모듈입니다.

## 설정

- `VITE_USE_MOCK=true` (기본값): mock 데이터 사용
- `VITE_USE_MOCK=false`: 실제 백엔드 API 호출
- `VITE_API_URL`: API 베이스 URL (예: `https://api.example.com`)

`.env` 파일에 설정하거나 빌드 시 환경 변수로 전달하세요.

## 에러 처리

API 호출 실패 시 `useApiErrorStore`에 에러가 저장되며, 화면 상단에 `ApiErrorBanner`로 표시됩니다. (401은 자동 로그아웃 처리)

## API 엔드포인트 (백엔드 구현 시 참고)

| 서비스 | 메서드 | 경로 | 설명 |
|--------|--------|------|------|
| mentees | GET | `/mentor/mentees` | 담당 멘티 목록 |
| mentees | GET | `/mentor/mentees/:id` | 멘티 상세 |
| assignments | GET | `/mentor/assignments/submitted` | 제출 과제 전체 |
| assignments | GET | `/mentor/mentees/:id/assignments/submitted` | 멘티별 제출 과제 |
| assignments | POST | `/mentor/mentees/:id/assignments` | 과제 등록 |
| menteeDetail | GET | `/mentor/mentees/:id/feedback` | 피드백 목록 |
| menteeDetail | GET | `/mentor/mentees/:id/assignments/incomplete` | 미완료 과제 |
| menteeDetail | GET | `/mentor/mentees/:id/tasks` | 학습 일정 |
| menteeDetail | GET | `/mentor/mentees/:id/comments/today` | 오늘의 한마디 |
| menteeDetail | GET | `/mentor/mentees/:id/kpi` | KPI 지표 |
| assignmentDetail | GET | `/mentor/mentees/:menteeId/assignments/:assignmentId` | 과제 상세 |
| feedback | GET | `/mentor/mentees/:menteeId/assignments/:assignmentId/feedback` | 피드백 조회 |
| feedback | POST | `/mentor/mentees/:menteeId/assignments/:assignmentId/feedback` | 피드백 제출 |
| learningAnalysis | GET | `/mentor/mentees/:id/learning/subject-times` | 과목별 학습 시간 |
| learningAnalysis | GET | `/mentor/mentees/:id/learning/weekly-patterns` | 주간 학습 패턴 |

## 통계 분석 리포트

통계 분석 리포트는 위의 API들을 조합하여 프론트엔드에서 생성합니다. 별도의 API 엔드포인트는 필요하지 않습니다.

**리포트 생성에 사용되는 API:**
- `/mentor/mentees/:id/learning/subject-times` - 과목별 학습 시간
- `/mentor/mentees/:id/learning/weekly-patterns` - 주간 학습 패턴
- `/mentor/mentees/:id/feedback` - 피드백 목록 (과목별 세부 분석용)
- `/mentor/mentees/:id/kpi` - KPI 지표

**리포트 기능:**
- 전반적인 학습 태도 및 공부 스타일 종합 분석
- 생활패턴 분석 (주간 학습 패턴, 과목별 학습 시간)
- 과목별 상세 분석 (국어/영어/수학)
- PDF 다운로드 (브라우저 인쇄 기능 활용)

## 인증

`useAuthStore`의 `accessToken`이 있으면 `Authorization: Bearer {token}` 헤더로 자동 첨부됩니다.

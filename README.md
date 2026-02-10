# 설스터디 (Blaybus)

멘토-멘티 간 학습 과정을 관리·점검·피드백할 수 있는 웹 기반 학습 코칭 도구

## Tech Stack

| 구분 | 기술 |
|------|------|
| **프레임워크/언어** | React 19, TypeScript |
| **빌드 도구** | Vite 7 |
| **상태 관리** | React Query (TanStack Query), Zustand |
| **스타일링** | Tailwind CSS |
| **폼/검증** | React Hook Form, Zod, @hookform/resolvers |
| **라우팅** | React Router v7 |
| **코드 품질** | ESLint 9, Prettier |

## 개발 환경

- **Node.js** 18+
- **npm**

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (Vite) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npm run lint:fix` | ESLint 자동 수정 |
| `npm run format` | Prettier 포맷 |

## 테스트 계정

| 역할 | ID | 비밀번호 |
|------|-----|----------|
| 멘티 | mentee01, mentee02 | test1234 |
| 멘토 | mentor01 | test1234 |

## 프로젝트 구조

```
src/
├── api/           # API 함수
├── components/     # 공통 컴포넌트
├── hooks/         # 커스텀 훅
├── lib/           # 유틸리티
├── pages/         # 페이지 컴포넌트
│   ├── mentor/    # 멘토 전용 페이지
│   └── mentee/    # 멘티 전용 페이지
├── stores/        # Zustand 스토어
├── types/         # TypeScript 타입
└── utils/         # 유틸 함수
```

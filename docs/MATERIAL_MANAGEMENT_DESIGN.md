# 학습 자료 관리 기능 설계

## 1. 자료 구분 방식

### 1.1 과목별 구분
- **국어**: 비문학, 문학, 문법, 화법과 작문
- **영어**: 독해/듣기/어휘, 문법, 쓰기
- **수학**: 미적분, 기하, 확률과 통계, 수학1, 수학2
- **기타**: 과학, 사회, 자기주도 등

### 1.2 파일 타입별 구분
- **PDF**: 학습 자료, 문제집, 가이드
- **이미지**: 도표, 그래프, 참고 이미지
- **문서**: Word, Excel, 기타 문서
- **기타**: 동영상, 오디오 등

### 1.3 용도별 구분
- **학습 가이드**: 학습 방법, 전략 가이드
- **문제/연습**: 문제집, 연습문제
- **참고 자료**: 참고서, 요약본
- **템플릿**: 재사용 가능한 템플릿

## 2. UI 구조 제안

### 2.1 상단 필터/검색 영역
```
[과목 필터] [파일 타입 필터] [검색창] [업로드 버튼]
```

### 2.2 자료 목록 영역
- **카드형 레이아웃**: 각 자료를 카드로 표시
- **목록형 레이아웃**: 테이블 형식으로 상세 정보 표시
- **폴더형 레이아웃**: 과목별/카테고리별로 폴더 구조

### 2.3 자료 카드 정보
- 파일명
- 파일 크기
- 업로드 날짜
- 과목/카테고리 태그
- 파일 타입 아이콘
- 미리보기 버튼
- 삭제/수정 버튼

## 3. 데이터 구조

```typescript
interface LearningMaterial {
  id: string;
  title: string;
  fileName: string;
  fileSize: number; // bytes
  fileType: 'pdf' | 'image' | 'document' | 'video' | 'audio' | 'other';
  mimeType: string; // 'application/pdf', 'image/png' 등
  subject: string; // '국어', '영어', '수학' 등
  subCategory?: string; // '비문학', '독해' 등
  category: 'guide' | 'practice' | 'reference' | 'template'; // 용도
  tags?: string[]; // 추가 태그
  uploadedAt: string; // ISO date string
  uploadedBy: string; // 멘토 ID
  fileUrl: string; // 파일 다운로드 URL
  thumbnailUrl?: string; // 미리보기 이미지 URL (PDF 첫 페이지 등)
  description?: string; // 자료 설명
  isPublic: boolean; // 모든 멘티에게 공개 여부
  targetMenteeIds?: string[]; // 특정 멘티에게만 공개
}
```

## 4. 기능 요구사항

### 4.1 파일 업로드
- 드래그 앤 드롭 지원
- 다중 파일 업로드
- 파일 크기 제한 (예: 50MB)
- 지원 파일 형식: PDF, 이미지 (JPG, PNG), 문서 (DOCX, XLSX)

### 4.2 자료 관리
- 자료 검색 (파일명, 태그, 설명)
- 필터링 (과목, 타입, 카테고리, 날짜)
- 정렬 (이름, 날짜, 크기)
- 자료 수정 (제목, 설명, 태그, 카테고리)
- 자료 삭제
- 자료 복사/이동

### 4.3 자료 활용
- 과제 등록 시 자료 선택
- 자료 미리보기
- 자료 다운로드
- 자료 공유 (특정 멘티에게만 공개)

## 5. UI 컴포넌트 구조

```
MaterialManagePage
├── MaterialFilterBar (필터/검색)
├── MaterialUploadArea (업로드 영역)
└── MaterialList
    ├── MaterialCard (카드형)
    │   ├── MaterialThumbnail (미리보기)
    │   ├── MaterialInfo (정보)
    │   └── MaterialActions (액션 버튼)
    └── MaterialGrid (그리드 레이아웃)
```

## 6. API 엔드포인트 제안

```
GET    /mentor/materials              # 자료 목록 조회
POST   /mentor/materials              # 자료 업로드
GET    /mentor/materials/:id          # 자료 상세 조회
PUT    /mentor/materials/:id          # 자료 수정
DELETE /mentor/materials/:id          # 자료 삭제
GET    /mentor/materials/:id/preview  # 자료 미리보기
GET    /mentor/materials/:id/download # 자료 다운로드
```

## 7. 구현 우선순위

### Phase 1 (기본 기능)
1. 파일 업로드 (단일 파일)
2. 자료 목록 표시 (카드형)
3. 과목별 필터링
4. 자료 삭제

### Phase 2 (고급 기능)
1. 다중 파일 업로드
2. 자료 검색
3. 자료 수정
4. 파일 타입별 필터링

### Phase 3 (추가 기능)
1. 자료 미리보기
2. 태그 시스템
3. 자료 공유 설정
4. 폴더 구조

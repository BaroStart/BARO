# 디자인 토큰 (Design Tokens)

> 멘티 UI 전반에 적용되는 spacing, 타이포, 컴포넌트 규칙

---

## 1. 컬러 시스템

- **브랜드 메인**: `hsl(var(--brand))` — CTA, 선택 상태, 강조
- **브랜드 라이트**: `hsl(var(--brand-light))` — 배경 톤, subtle highlight
- **텍스트**: `slate-900`(제목) / `slate-600`(본문) / `slate-400`(보조)
- **테두리**: `slate-100` / `slate-200`(hover)
- 상세: `docs/COLOR_SYSTEM.md` 참고

---

## 2. Spacing (간격)

| 용도 | Token | Tailwind | 용도 |
|------|-------|----------|------|
| 카드 간격 | `space-y-5` | 20px | 리스트 내 카드 사이 |
| 섹션 간격 | `space-y-6` | 24px | 섹션 사이 |
| 카드 패딩 | `p-4` ~ `p-5` | 16~20px | 카드 내부 |
| 아이콘-텍스트 | `gap-4` | 16px | 플렉스 아이템 간 |
| 그리드 갭 | `gap-4` | 16px | 그리드 셀 간 |

---

## 3. Typography (타이포 위계)

| 역할 | 크기 | weight | 색상 | 용도 |
|------|------|--------|------|------|
| 제목 | `text-base` ~ `text-lg` | `font-bold` | `slate-900` | 카드 제목, 섹션 제목 |
| 보조 제목 | `text-[11px]` | `font-semibold` | `slate-400` | 과목명, 날짜, 상태 |
| 본문 | `text-sm` | `font-normal` | `slate-600` ~ `slate-700` | 설명, 피드백 본문 |
| 날짜/시간 | `text-[11px]` | `font-medium` | `slate-400` | 제출 완료, 마감, N시간 전 |

---

## 4. 컴포넌트 규칙

### 4.1 카드

- `rounded-2xl`, `border border-slate-100`, `shadow-sm`
- hover: `hover:border-slate-200 hover:shadow-md`
- 내부 패딩: `p-4` 또는 `p-5`

### 4.2 아이콘 셀 (과목 아이콘 등)

- `overflow-hidden`, `rounded-xl`, `border border-slate-100`, `bg-slate-50`
- 아이콘: `h-5 w-5 text-[hsl(var(--brand))]` (브랜드 컬러)

### 4.3 콘텐츠 블록 (피드백 본문 등)

- `rounded-lg`, `border-l-4 border-[hsl(var(--brand))]`, `bg-slate-50/80`
- `px-3 py-2.5` — 인용구 느낌으로 본문 강조

### 4.4 버튼/필터

- 선택: `bg-slate-900 text-white` 또는 `bg-[hsl(var(--brand))] text-white`
- 미선택: `bg-white border border-slate-200 text-slate-600`

### 4.5 프로필 원형

- `rounded-full`, `border border-slate-100`, `bg-slate-50`
- 크기: `h-9 w-9` ~ `h-10 w-10`

---

## 5. 페이지별 적용 요약

| 화면 | 간격 | 카드 스타일 | 강조 |
|------|------|-------------|------|
| 과제 리스트 | `space-y-5` | 아이콘 영역 경계, 제목/설명/날짜 위계 | 브랜드 아이콘 |
| 피드백 | `space-y-6` | blockquote 본문, 멘토명·날짜 분리 | NEW 뱃지, 과제 보기 링크 |
| 달성률 | `gap-4` | 링 차트 브랜드, 카드 border | 퍼센트 브랜드 |
| 캘린더 | 브랜드 강도 색상 | 선택일 브랜드 | 범례·주간보기 버튼 |
| 뱃지 | `gap-y-5 gap-x-3` | 형태 차별화(원/사각), 잠김 dashed | 획득 시 shadow |

---

## 6. 일관성 체크리스트

- [ ] 모든 강조/선택에 `hsl(var(--brand))` 사용
- [ ] 테두리·배경은 `slate` 계열 유지
- [ ] 카드 간 `space-y-5` 이상
- [ ] 아이콘 영역에 `overflow-hidden`·`border`로 경계 처리
- [ ] 제목 > 본문 > 보조 (크기·weight·색상) 위계 유지

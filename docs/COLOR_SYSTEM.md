# 컬러 시스템 (GLOBAL_PALETTES)

> Teal 기반 기본, 7가지 테마 (기본/파스텔/스토리/소프트민트/모노톤/비비드/차분)

## 컬러 팔레트 파일 위치

| 파일 | 용도 |
|------|------|
| `src/lib/timetableColorStorage.ts` | **GLOBAL_PALETTES** 정의, PALETTE_TO_BRAND, 타임테이블 팔레트 |
| `src/lib/globalThemeStorage.ts` | 설정 페이지용 GLOBAL_THEMES (default/pastel/calm/vivid/softMint) |
| `src/index.css` | `:root` CSS 변수 (--brand, --brand-light, --brand-medium) 초기값 |

## GLOBAL_PALETTES (timetableColorStorage.ts)

| 테마 | brand | brandMedium | brandLight |
|------|-------|-------------|------------|
| 기본 (Teal) | 193 55% 45% | 193 45% 82% | 193 40% 96% |
| 파스텔 | 199 45% 72% | 199 40% 88% | 199 35% 96% |
| 스토리 | 210 50% 75% | 210 40% 88% | 210 35% 96% |
| 소프트 민트 | 160 40% 68% | 160 35% 85% | 160 30% 95% |
| 모노톤 | 215 15% 35% | 215 10% 80% | 215 10% 96% |
| 비비드 | 199 65% 55% | 199 55% 82% | 199 45% 95% |
| 차분 | 215 25% 40% | 215 20% 85% | 215 15% 96% |

## 브랜드 컬러 (기본 테마)

- **메인**: `hsl(var(--brand))` — Teal (primary brand)
- **서브**: `hsl(var(--brand-medium))` — hover, accent
- **라이트**: `hsl(var(--brand-light))` — 배경 톤, subtle highlight

## 컬러 역할

| 역할 | CSS 변수 | 용도 |
|------|----------|------|
| 메인 | `--brand` | CTA, 선택 상태, 강조 |
| 서브 | `--brand-medium` | hover, 그라데이션 끝 |
| 포인트 | `--brand-light` | 배경 톤, subtle highlight |
| 배경 | `--background` | 페이지 배경 (흰색) |
| 텍스트 기본 | `--foreground` | 본문 |
| 텍스트 보조 | `--muted-foreground` | 보조 정보 |

## 사용 원칙

1. **포인트만**: 버튼, 선택된 날짜, 프로그레스 바 등 핵심 action에만 brand 사용
2. **과한 색 X**: 카드 배경, 테두리는 slate/gray 계열
3. **일관성**: 한 페이지에 brand는 1~2곳만

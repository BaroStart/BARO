/**
 * 인스타그램 DM 아이콘 (Paper plane)
 * - 시각적 중심(optical center)을 위해 viewBox 내 좌측 상단 여백 조정
 * - 기하학적 중심보다 왼쪽으로 치우친 형태를 보정
 */
interface IconProps {
  className?: string;
  strokeWidth?: number;
}

export function DmIcon({ className = "h-5 w-5", strokeWidth = 2 }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="-1 0 25 24"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

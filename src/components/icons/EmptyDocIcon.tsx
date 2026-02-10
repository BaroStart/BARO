interface IconProps {
  className?: string;
}

export function EmptyDocIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <rect x="10" y="8" width="28" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16 18h16M16 24h10M16 30h6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

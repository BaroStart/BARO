interface IconProps {
  className?: string;
}

export function EmptyNotificationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <rect x="8" y="10" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 16h24" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="23" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

interface IconProps {
  className?: string;
}

export function SystemIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M10 3.5a4.5 4.5 0 0 0-4.5 4.5c0 2.1-.7 3.6-1.2 4.4a.6.6 0 0 0 .5.85h10.4a.6.6 0 0 0 .5-.85c-.5-.8-1.2-2.3-1.2-4.4A4.5 4.5 0 0 0 10 3.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 13.25a1.5 1.5 0 0 0 3 0"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

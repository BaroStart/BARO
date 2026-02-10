interface IconProps {
  className?: string;
}

export function ListIcon({ className = 'h-[22px] w-[22px]' }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 19h.01" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 19h13" />
    </svg>
  );
}

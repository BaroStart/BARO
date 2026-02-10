interface IconProps {
  className?: string;
}

export function PlusIcon({ className = 'h-[22px] w-[22px]' }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14" />
    </svg>
  );
}

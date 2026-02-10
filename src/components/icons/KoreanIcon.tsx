interface IconProps {
  className?: string;
}

export function KoreanIcon({ className = 'h-[22px] w-[22px]' }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 8 6 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 14 6-6 2-3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 5h12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 2h1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m22 22-5-10-5 10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 18h6" />
    </svg>
  );
}

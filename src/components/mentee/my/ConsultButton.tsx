type Props = {
  formUrl: string;
  className?: string;
};

export function ConsultButton({ formUrl, className }: Props) {
  return (
    <div
      className={["fixed left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg", "bottom-[calc(4rem+1rem)]", "z-50 pointer-events-none", 
        className ?? "",
      ].join(" ")}
    >
      <div className="flex justify-end px-4">
        <button
          type="button"
          onClick={() => window.open(formUrl, "_blank", "noopener,noreferrer")}
          aria-label="상담 신청"
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-white shadow-lg transition active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12a8 8 0 0 1 16 0v6a2 2 0 0 1-2 2h-2v-6h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 12v6a2 2 0 0 0 2 2h2v-6H4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-semibold">상담 신청</span>
        </button>
      </div>
    </div>
  );
}

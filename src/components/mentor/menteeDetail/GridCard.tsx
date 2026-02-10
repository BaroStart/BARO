export function GridCard({
  title,
  icon,
  badge,
  actions,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[420px] flex-col rounded-xl border border-border/50 bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-border/30 px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {icon}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground/60">
              {badge}
            </span>
          )}
          {actions}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">{children}</div>
    </div>
  );
}

export function KpiCard({
  title,
  value,
  change,
  suffix,
  className,
}: {
  title: string;
  value: string;
  change?: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={className ?? 'rounded-lg border border-border/50 bg-secondary/20 p-3'}>
      <p className="text-[11px] font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
      {change != null && change !== 0 && (
        <p className="mt-1 text-xs text-slate-600">
          {change > 0 ? '+' : ''}
          {change}
          {suffix}
        </p>
      )}
    </div>
  );
}

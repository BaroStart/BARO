import * as React from 'react';

import { cn } from '@/lib/utils';

interface FilterTabItem<T extends string> {
  id: T;
  label: React.ReactNode;
}

interface FilterTabsProps<T extends string> {
  items: FilterTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: FilterTabsProps<T>) {
  return (
    <div className={cn('inline-flex h-9 items-center rounded-lg bg-secondary p-0.5', className)}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            'h-8 rounded-md px-3 text-sm font-medium transition-colors',
            value === item.id
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

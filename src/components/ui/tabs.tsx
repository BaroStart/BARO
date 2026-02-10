import * as React from 'react';

import { cn } from '@/lib/utils';

type TabVariant = 'underline' | 'pill';

interface TabItem<T extends string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: TabVariant;
  className?: string;
  /** 탭 우측에 추가할 콘텐츠 (버튼 등) */
  rightContent?: React.ReactNode;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'underline',
  className,
  rightContent,
}: TabsProps<T>) {
  if (variant === 'pill') {
    return (
      <div className={cn('flex rounded-lg bg-secondary p-1', className)}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors',
                value === item.id
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  // underline variant
  return (
    <div className={cn('flex items-center justify-between border-b border-border', className)}>
      <div className="flex gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                value === item.id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground',
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </button>
          );
        })}
      </div>
      {rightContent && <div className="pb-2">{rightContent}</div>}
    </div>
  );
}

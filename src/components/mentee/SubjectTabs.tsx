import { cn } from '@/lib/utils';

type Subject = 'ALL' | 'KOREAN' | 'ENGLISH' | 'MATH' | 'ETC';

interface SubjectTabsProps {
  value: Subject;
  onChange: (value: Subject) => void;
}

const TABS: { label: string; value: Subject }[] = [
  { label: '전체', value: 'ALL' },
  { label: '국어', value: 'KOREAN' },
  { label: '영어', value: 'ENGLISH' },
  { label: '수학', value: 'MATH' },
];

export function SubjectTabs({ value, onChange }: SubjectTabsProps) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex px-4">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative px-4 py-3 text-[13px] font-medium transition-colors',
              value === tab.value ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {tab.label}
            {value === tab.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { Subject };

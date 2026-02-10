import { cn } from '@/lib/utils';

interface AssignmentDetailTabsProps {
  activeTab: 'info' | 'feedback';
  setActiveTab: (tab: 'info' | 'feedback') => void;
  isCompleted?: boolean;
}

export default function AssignmentDetailTabs({
  activeTab,
  setActiveTab,
  isCompleted = false,
}: AssignmentDetailTabsProps) {
  return (
    <div className="sticky top-0 z-10 flex border-b border-slate-100 bg-white">
      <button
        type="button"
        onClick={() => setActiveTab('info')}
        className={cn(
          'relative flex-1 px-4 py-3 text-[13px] font-medium transition-colors',
          activeTab === 'info' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
        )}
      >
        과제 정보
        {activeTab === 'info' && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
        )}
      </button>
      {isCompleted && (
        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={cn(
            'relative flex-1 px-4 py-3 text-[13px] font-medium transition-colors',
            activeTab === 'feedback' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          피드백
          {activeTab === 'feedback' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
          )}
        </button>
      )}
    </div>
  );
}

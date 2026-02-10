import { Check, Edit3, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import type { IncompleteAssignment } from '@/types';

export function IncompleteAssignmentCard({
  assignment,
  onComplete,
  onDelete,
  onViewAssignment,
  showDeleteConfirm,
  onConfirmDelete,
  onCancelDelete,
}: {
  assignment: IncompleteAssignment;
  onComplete: () => void;
  onDelete: () => void;
  onViewAssignment: () => void;
  showDeleteConfirm: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const isCompleted = assignment.status === 'completed';
  const isUrgent = assignment.status === 'deadline_soon';

  return (
    <div
      role="button"
      tabIndex={0}
      className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-secondary/20 ${isUrgent ? 'border-rose-200 bg-rose-50/20' : 'border-border/40 hover:border-border'}`}
      onClick={onViewAssignment}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewAssignment();
        }
      }}
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!isCompleted) onComplete();
          }}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isCompleted ? 'border-foreground/70 bg-foreground/70 text-white' : 'border-border/60 hover:border-foreground/50'}`}
        >
          {isCompleted && <Check className="h-3 w-3" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-foreground">{assignment.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {assignment.subject} · {isCompleted ? assignment.completedAt : assignment.deadline}
            {isUrgent && <span className="ml-1 font-medium text-rose-600">마감 임박</span>}
          </p>
        </div>
        {!isCompleted && (
          <div className="relative flex shrink-0 gap-0.5">
            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground/70"
              title="수정"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            {showDeleteConfirm ? (
              <div className="absolute right-0 top-8 z-10 flex gap-1 rounded-lg border border-border/50 bg-white p-2 shadow-lg">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirmDelete();
                  }}
                >
                  삭제
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelDelete();
                  }}
                >
                  취소
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600"
                title="삭제"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

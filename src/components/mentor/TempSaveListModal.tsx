import { FileText, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import type { DraftAssignment } from '@/data/assignmentRegisterMock';

interface TempSaveListModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: DraftAssignment[];
  onLoadDraft: (draft: DraftAssignment) => void;
}

export function TempSaveListModal({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
}: TempSaveListModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">임시저장 목록</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-4">
          {drafts.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">임시저장된 과제가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{draft.title}</p>
                    <p className="text-xs text-slate-500">
                      {draft.menteeName} · {draft.subject} · {draft.savedAt}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => onLoadDraft(draft)}>
                    불러오기
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

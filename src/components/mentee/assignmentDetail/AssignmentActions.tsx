import { Check, Edit, Save, Send } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface AssignmentActionsProps {
  assignment: Assignment;
  isEditing: boolean;
  onChangeToEditMode: () => void;
  onSubmitAssignment?: () => void;
  onSaveDraft?: () => void;
  onSubmitEdit?: () => void;
}

export default function AssignmentActions({
  assignment,
  isEditing,
  onChangeToEditMode,
  onSubmitAssignment,
  onSaveDraft,
  onSubmitEdit,
}: AssignmentActionsProps) {
  const isSubmitted = assignment.status === '완료';

  const renderButtons = () => {
    // 1. 미제출 상태: 임시저장 + 제출하기 (1:1)
    if (!isSubmitted) {
      return (
        <>
          <Button
            type="button"
            onClick={onSaveDraft}
            className="flex-1 h-12 gap-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <Save className="w-4 h-4" />
            임시저장
          </Button>
          <Button
            type="button"
            onClick={onSubmitAssignment}
            className="flex-1 h-12 gap-2 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-900 text-white"
          >
            <Send className="w-4 h-4" />
            과제 제출하기
          </Button>
        </>
      );
    }

    // 2. 제출 완료 + 수정 모드: 임시저장 + 수정 완료
    if (isEditing) {
      return (
        <>
          <Button
            type="button"
            onClick={onSaveDraft}
            className="flex-1 h-12 gap-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <Save className="w-4 h-4" />
            임시저장
          </Button>
          <Button
            type="button"
            onClick={onSubmitEdit}
            className="flex-1 h-12 gap-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
          >
            <Check className="w-4 h-4" />
            수정 완료
          </Button>
        </>
      );
    }

    // 3. 제출 완료 + 일반(조회) 모드: 수정하기만 표시
    return (
      <Button
        onClick={onChangeToEditMode}
        className="w-full h-12 gap-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
      >
        <Edit className="w-4 h-4" />
        수정하기
      </Button>
    );
  };

  return <div className="flex justify-center w-full gap-3">{renderButtons()}</div>;
}

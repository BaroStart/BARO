import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AssignmentActions from '@/components/mentee/assignmentDetail/AssignmentActions';
import AssignmentDetailHeader from '@/components/mentee/assignmentDetail/AssignmentDetailHeader';
import AssignmentDetailTabs from '@/components/mentee/assignmentDetail/AssignmentDetailTabs';
import AssignmentFeedback from '@/components/mentee/assignmentDetail/AssignmentFeedback';
import AssignmentInfo from '@/components/mentee/assignmentDetail/AssignmentInfo';
import type { PreviewImage } from '@/components/mentee/assignmentDetail/StudyVerification';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { toast } from '@/components/ui/Toast';
import { useMenteeAssignmentDetail, useSubmitAssignment } from '@/hooks/useMenteeAssignments';
import {
  compressImageToDataUrl,
  loadDraft,
  removeDraft,
  saveDraft,
} from '@/lib/assignmentDraftStorage';
import { mapDetailToAssignment, mapDetailToAssignmentDetail } from '@/lib/assignmentMapper';
import { pad2 } from '@/lib/dateUtils';
import { useAssignmentDetailUIStore } from '@/stores/useAssignmentDetailUIStore';

export function AssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'feedback'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [memo, setMemo] = useState('');
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [savedDraftInfo, setSavedDraftInfo] = useState('');

  const currentAssignmentId = assignmentId ?? '';

  // API 데이터 조회 (목업 시 URL의 assignmentId가 "a1" 등 문자열일 수 있음)
  const { data: apiDetail, isLoading, isError } = useMenteeAssignmentDetail(currentAssignmentId);
  const mapped = apiDetail ? mapDetailToAssignment(apiDetail) : null;
  const assignment =
    mapped && currentAssignmentId
      ? { ...mapped, id: /^\d+$/.test(currentAssignmentId) ? mapped.id : currentAssignmentId }
      : null;
  const detail = apiDetail ? mapDetailToAssignmentDetail(apiDetail) : null;

  // API 메모 복원
  useEffect(() => {
    if (apiDetail?.memo && !memo) {
      setMemo(apiDetail.memo);
    }
  }, [apiDetail?.memo]); // eslint-disable-line react-hooks/exhaustive-deps

  // 제출 mutation
  const submitMutation = useSubmitAssignment();
  const setIsSubmitted = useAssignmentDetailUIStore((s) => s.setIsSubmitted);
  const setOnDelete = useAssignmentDetailUIStore((s) => s.setOnDelete);
  const isSubmitted = assignment?.status === '완료';

  // 레이아웃 헤더에 제출 상태 + 삭제 콜백 공유
  useEffect(() => {
    setIsSubmitted(isSubmitted);
    if (isSubmitted) {
      setOnDelete(() => {
        // TODO: 백엔드 삭제 API 연결
        toast.success('삭제가 완료되었습니다.');
        navigate('/mentee/assignments', { replace: true });
      });
    }
    return () => {
      setIsSubmitted(false);
      setOnDelete(null);
    };
  }, [isSubmitted, setIsSubmitted, setOnDelete, navigate]);

  // 수정 완료 (TODO: API 연결)
  const handleSubmitEdit = useCallback(() => {
    toast.success('수정이 완료되었습니다.');
    removeDraft(currentAssignmentId);
    setIsEditing(false);
  }, [currentAssignmentId]);

  // 임시저장 복원 팝업 (마운트 시)
  useEffect(() => {
    const draft = loadDraft(currentAssignmentId);
    if (draft && (draft.memo || draft.photos.length > 0)) {
      const d = new Date(draft.savedAt);
      setSavedDraftInfo(
        `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
      );
      setShowDraftDialog(true);
    }
  }, [currentAssignmentId]);

  const handleRestoreDraft = useCallback(() => {
    const draft = loadDraft(currentAssignmentId);
    if (draft) {
      setMemo(draft.memo);
      if (draft.photos.length > 0) {
        setPreviewImages(draft.photos.map((p) => ({ id: p.id, url: p.dataUrl, name: p.name })));
      }
    }
    setShowDraftDialog(false);
  }, [currentAssignmentId]);

  const handleDiscardDraft = useCallback(() => {
    removeDraft(currentAssignmentId);
    setShowDraftDialog(false);
  }, [currentAssignmentId]);

  const handleSaveDraft = useCallback(async () => {
    const photos = await Promise.all(
      previewImages.map(async (img) => {
        const dataUrl = img.file ? await compressImageToDataUrl(img.file) : img.url;
        return { id: img.id, name: img.name, dataUrl };
      }),
    );
    const success = saveDraft(currentAssignmentId, {
      memo,
      photos,
      savedAt: new Date().toISOString(),
    });
    toast[success ? 'success' : 'error'](
      success ? '임시저장되었습니다.' : '임시저장에 실패했습니다. 저장 공간이 부족합니다.',
    );
  }, [currentAssignmentId, memo, previewImages]);

  // 과제 제출
  const handleSubmitAssignment = useCallback(async () => {
    const numId = Number(currentAssignmentId);
    if (!numId || isNaN(numId)) return;

    const files = previewImages.map((img) => img.file).filter((f): f is File => !!f);

    try {
      await submitMutation.mutateAsync({
        assignmentId: numId,
        memo: memo || undefined,
        files: files.length > 0 ? files : undefined,
      });
      removeDraft(currentAssignmentId);
      toast.success('과제가 제출되었습니다.');
    } catch {
      toast.error('과제 제출에 실패했습니다.');
    }
  }, [currentAssignmentId, memo, previewImages, submitMutation]);

  const handleAddImages = useCallback((images: PreviewImage[]) => {
    setPreviewImages((prev) => [...prev, ...images]);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setPreviewImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleClearImages = useCallback(() => {
    setPreviewImages([]);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // 미완료 과제에서 피드백 탭 진입 방지
  useEffect(() => {
    if (assignment && assignment.status !== '완료' && activeTab === 'feedback') {
      setActiveTab('info');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment?.status, activeTab]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
        <p className="text-sm text-slate-400">과제를 불러오는 중...</p>
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="text-sm text-slate-400">과제를 불러오지 못했어요</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <AssignmentDetailHeader assignment={assignment} />

      <AssignmentDetailTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCompleted={assignment.status === '완료'}
      />

      {activeTab === 'info' && (
        <AssignmentInfo
          assignment={assignment}
          detail={detail}
          memo={memo}
          onMemoChange={setMemo}
          previewImages={previewImages}
          onAddImages={handleAddImages}
          onRemoveImage={handleRemoveImage}
          onClearImages={handleClearImages}
          isEditing={isEditing}
        />
      )}
      {activeTab === 'feedback' && assignment.status === '완료' && <AssignmentFeedback />}

      {activeTab === 'info' && (
        <div
          className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-slate-100 bg-white px-4 py-3 sm:max-w-lg"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <AssignmentActions
            assignment={assignment}
            isEditing={isEditing}
            onChangeToEditMode={() => setIsEditing(true)}
            onSubmitAssignment={handleSubmitAssignment}
            onSaveDraft={handleSaveDraft}
            onSubmitEdit={handleSubmitEdit}
          />
        </div>
      )}

      <Dialog open={showDraftDialog} onClose={() => setShowDraftDialog(false)} maxWidth="max-w-sm">
        <DialogHeader>
          <h3 className="text-sm font-semibold text-slate-900">작성 중인 내용이 있습니다</h3>
        </DialogHeader>
        <DialogBody className="pt-0">
          <p className="text-xs text-slate-500">{savedDraftInfo}에 임시저장된 내용을 불러올까요?</p>
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={handleDiscardDraft}
            className="h-8 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            삭제
          </Button>
          <Button
            onClick={handleRestoreDraft}
            className="h-8 px-3 text-xs font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-900"
          >
            불러오기
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

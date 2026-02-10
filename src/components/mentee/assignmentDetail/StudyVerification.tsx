import { type ChangeEvent, useRef } from 'react';

import { Camera, CheckCircle2, ImageIcon, Info, PenTool, X } from 'lucide-react';

import type { AssignmentDetail } from '@/types';

export type PreviewImage = {
  id: string;
  url: string;
  name: string;
  file?: File;
};

interface StudyVerificationProps {
  assignment: Assignment;
  detail: AssignmentDetail | null;
  memo: string;
  onMemoChange: (memo: string) => void;
  previewImages: PreviewImage[];
  onAddImages: (images: PreviewImage[]) => void;
  onRemoveImage: (id: string) => void;
  onClearImages: () => void;
  isEditing: boolean;
}

export default function StudyVerification({
  assignment,
  detail,
  memo,
  onMemoChange,
  previewImages,
  onAddImages,
  onRemoveImage,
  onClearImages,
  isEditing,
}: StudyVerificationProps) {
  const isCompleted = assignment.status === '완료';
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const canEdit = !isCompleted || isEditing;
  const submittedPhotos = detail?.studentPhotos ?? [];
  const MEMO_MAX_LENGTH = 500;

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };
  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: PreviewImage[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));

    onAddImages(newPhotos);
    e.target.value = '';
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Camera className="w-4 h-4 text-slate-900" />
        <h3 className="text-sm font-semibold text-slate-900">
          {isCompleted ? '제출 내역' : '공부 인증'}
        </h3>
      </div>

      {/* 제출 전이거나 수정 중 */}
      {(!isCompleted || isEditing) && (
        <>
          {/* 인증 가이드 */}
          <div className="p-4 mb-6 bg-slate-50 rounded-xl">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-700">인증 가이드:</span> 노트와 문제
                풀이를 선명하게 촬영해주세요. 여러 장을 나눠 찍어도 좋습니다.
                <br />
                마감일이 지나도 소급 제출 가능합니다! 😄
              </p>
            </div>
          </div>

          {/* 사진 첨부 버튼 */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-3">
              <button
                className="group flex flex-col items-center justify-center gap-2 h-28 rounded-xl border border-dashed border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all bg-white"
                onClick={handleCameraClick}
              >
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">카메라로 찍기</span>
              </button>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={cameraInputRef}
                onChange={handleFileChange}
              />

              <button
                className="group flex flex-col items-center justify-center gap-2 h-28 rounded-xl border border-dashed border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all bg-white"
                onClick={handleGalleryClick}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">갤러리 선택</span>
              </button>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={galleryInputRef}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </>
      )}

      {/* 미제출 + 사진 없을 때만 빈 안내 (제출 완료 시에는 안 보임) */}
      {!isCompleted && previewImages.length === 0 && submittedPhotos.length === 0 && (
        <div className="p-5 mb-6 text-center rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-sm text-slate-400">
            아직 첨부된 사진이 없어요.
            <br />위 버튼을 눌러 공부한 내용을 인증해주세요!
          </p>
        </div>
      )}

      {/* 제출 완료 + 사진 없을 때 */}
      {isCompleted && previewImages.length === 0 && submittedPhotos.length === 0 && (
        <div className="p-4 mb-6 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-sm text-slate-400">제출된 사진이 없습니다.</p>
        </div>
      )}

      {/* 제출된 사진 */}
      {submittedPhotos.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center gap-1 text-xs font-medium text-slate-900">
              <ImageIcon className="w-3.5 h-3.5" />
              제출된 사진 ({submittedPhotos.length})
            </h4>
          </div>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-6 px-6 [&::-webkit-scrollbar]:hidden">
            {submittedPhotos.map((p, i) => (
              <div
                key={p.id}
                className="relative flex-shrink-0 snap-start overflow-hidden border w-28 aspect-square bg-slate-100 rounded-xl group border-slate-100"
              >
                <img
                  src={p.url}
                  alt={p.caption ?? `제출 사진 ${i + 1}`}
                  className="object-cover w-full h-full"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">
                  {i + 1}/{submittedPhotos.length}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 새로 첨부한 사진 */}
      {previewImages.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center gap-1 text-xs font-medium text-slate-900">
              <ImageIcon className="w-3.5 h-3.5" />
              첨부된 사진 ({previewImages.length})
            </h4>
            {canEdit && (
              <button
                onClick={onClearImages}
                className="text-xs underline text-slate-500 decoration-slate-300 hover:text-slate-900"
              >
                전체 삭제
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-6 px-6 [&::-webkit-scrollbar]:hidden">
            {previewImages.map((img, i) => (
              <div
                key={img.id}
                className="relative flex-shrink-0 snap-start overflow-hidden border w-28 aspect-square bg-slate-100 rounded-xl group border-slate-100"
              >
                <img src={img.url} alt={img.name} className="object-cover w-full h-full" />
                <div className="absolute inset-0 transition-opacity opacity-0 bg-black/20 group-hover:opacity-100" />
                {canEdit && (
                  <button
                    onClick={() => onRemoveImage(img.id)}
                    className="absolute flex items-center justify-center w-6 h-6 transition-opacity bg-white rounded-full shadow-sm opacity-0 top-2 right-2 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5 text-slate-900" />
                  </button>
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">
                  {i + 1}/{previewImages.length}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 제출 완료 시간 */}
      {isCompleted && (
        <div className="flex items-center gap-2 p-3 mb-8 border bg-slate-50 border-slate-100 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-slate-900" />
          <span className="text-xs font-medium text-slate-700">
            {assignment.submissionDate} 제출 완료
          </span>
        </div>
      )}

      {/* 메모 */}
      {isCompleted && !isEditing ? (
        <div className="mb-4">
          <h4 className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-900">
            <PenTool className="w-3.5 h-3.5" />
            메모
          </h4>
          <div className="w-full h-auto p-4 text-xs leading-relaxed border rounded-xl border-slate-100 bg-slate-50 text-slate-600">
            {memo || '작성된 메모가 없습니다.'}
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <h4 className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-900">
            <PenTool className="w-3.5 h-3.5" />
            메모 (선택)
          </h4>
          <textarea
            className="w-full h-24 p-4 rounded-xl border border-slate-100 text-xs leading-relaxed focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 resize-none"
            placeholder="과제를 하면서 어려웠던 점이나 질문할 내용을 자유롭게 적어주세요."
            value={memo}
            onChange={(e) => onMemoChange(e.target.value.slice(0, MEMO_MAX_LENGTH))}
            maxLength={MEMO_MAX_LENGTH}
          />
          <div className="flex items-center justify-end mt-2">
            <span className="text-xs text-slate-400">
              {memo.length} / {MEMO_MAX_LENGTH}자
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

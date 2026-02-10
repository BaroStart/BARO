import AssignmentContent from '@/components/mentee/assignmentDetail/AssignmentContent';
import AssignmentResources from '@/components/mentee/assignmentDetail/AssignmentResources';
import StudyVerification, { type PreviewImage } from '@/components/mentee/assignmentDetail/StudyVerification';
import type { AssignmentDetail } from '@/types';

interface AssignmentInfoProps {
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

export default function AssignmentInfo({
  assignment,
  detail,
  memo,
  onMemoChange,
  previewImages,
  onAddImages,
  onRemoveImage,
  onClearImages,
  isEditing,
}: AssignmentInfoProps) {
  return (
    <div className="px-6 py-6 pb-28 space-y-8">
      {/* 과제 내용 */}
      <AssignmentContent detail={detail} />

      {/* 학습 자료 */}
      <AssignmentResources detail={detail} />

      {/* 공부 인증 + 메모 */}
      <StudyVerification
        assignment={assignment}
        detail={detail}
        memo={memo}
        onMemoChange={onMemoChange}
        previewImages={previewImages}
        onAddImages={onAddImages}
        onRemoveImage={onRemoveImage}
        onClearImages={onClearImages}
        isEditing={isEditing}
      />
    </div>
  );
}

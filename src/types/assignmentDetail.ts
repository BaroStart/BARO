/** 과제 상세 (모달 표시용) */
export interface AssignmentDetail {
  assignmentId: string;
  title: string;
  subject: string;
  date: string;
  goal: string;
  content: string;
  /** 과제 내용 체크리스트 (체크 아이콘 + 텍스트) */
  contentChecklist?: string[];
  /** 관련 자료 태그 (수학 오답노트 양식 등) */
  relatedResources?: { id: string; name: string }[];
  /** 설스터디 칼럼 (학습 팁) */
  studyColumn?: { title: string; content: string; readMoreLink?: string };
  /** 멘토가 제공한 PDF 파일 */
  providedPdfs: { id: string; name: string; size?: string }[];
  /** 학생이 제출한 사진 */
  studentPhotos: { id: string; url: string; caption?: string }[];
  /** 학생 메모 */
  studentMemo?: string;
}

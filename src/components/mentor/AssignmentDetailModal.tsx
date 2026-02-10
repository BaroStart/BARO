import { Check, Lightbulb, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useAssignmentDetail } from '@/hooks/useAssignmentDetail';
import type { AssignmentDetail } from '@/types';

interface AssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  source: 'feedback' | 'incomplete';
  feedbackStatus?: 'urgent' | 'pending' | 'partial' | 'completed' | null;
  menteeId?: string;
  fallback?: { title: string; goal?: string; subject?: string };
  overrides?: Partial<AssignmentDetail>;
  onSave?: (data: Partial<AssignmentDetail>) => void;
}

function buildFallbackDetail(
  assignmentId: string,
  fallback: { title: string; goal?: string; subject?: string }
): AssignmentDetail {
  return {
    assignmentId,
    title: fallback.title,
    subject: fallback.subject ?? '과목',
    date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    goal: fallback.goal ?? '-',
    content: '<p>과제 상세 내용이 등록되지 않았습니다.</p>',
    providedPdfs: [],
    studentPhotos: [],
  };
}

export function AssignmentDetailModal({
  isOpen,
  onClose,
  assignmentId,
  source,
  feedbackStatus,
  menteeId,
  fallback,
  overrides,
  onSave,
}: AssignmentDetailModalProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    goal: '',
    content: '',
    contentChecklist: [] as string[],
  });

  const { data: apiDetail, isLoading } = useAssignmentDetail(
    menteeId,
    assignmentId,
    { enabled: isOpen && !!menteeId && !!assignmentId }
  );

  const detail = useMemo((): AssignmentDetail | null => {
    const base = apiDetail ?? (fallback ? buildFallbackDetail(assignmentId, fallback) : null);
    if (!base) return null;
    return { ...base, ...overrides } as AssignmentDetail;
  }, [apiDetail, fallback, assignmentId, overrides]);

  if (!isOpen) return null;
  if (!detail && !isLoading) return null;

  const showLoading = isLoading && !detail;
  const d = detail!;

  const handleEditClick = () => {
    if (source === 'incomplete' && menteeId) {
      const columnContent =
        d.contentChecklist && d.contentChecklist.length > 0
          ? `<h3>과제 내용</h3>\n<ul>\n${d.contentChecklist.map((item) => `  <li>${item}</li>`).join('\n')}\n</ul>`
          : d.content;
      const subjectMap: Record<string, string> = {
        국어: '국어',
        영어: '영어',
        수학: '수학',
        과학: '수학',
        사회: '국어',
        자기주도: '국어',
      };
      onClose();
      navigate(`/mentor/mentees/${menteeId}/assignments/new`, {
        state: {
          editAssignment: {
            title: d.title,
            goal: d.goal,
            subject: subjectMap[d.subject] ?? '국어',
            columnContent,
          },
        },
      });
      return;
    }
    startEdit();
  };

  const startEdit = () => {
    const checklist = d.contentChecklist ?? [];
    setEditForm({
      title: d.title,
      goal: d.goal,
      content: checklist.length > 0 ? '' : d.content,
      contentChecklist: checklist,
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = () => {
    const filteredChecklist = editForm.contentChecklist.filter((s) => s.trim());
    const data: Partial<AssignmentDetail> = {
      title: editForm.title,
      goal: editForm.goal,
      content: filteredChecklist.length > 0 ? '' : editForm.content,
      contentChecklist:
        filteredChecklist.length > 0 ? filteredChecklist : undefined,
    };
    onSave?.(data);
    setIsEditing(false);
  };

  const addChecklistItem = () => {
    setEditForm((prev) => ({
      ...prev,
      contentChecklist: [...prev.contentChecklist, ''],
    }));
  };

  const updateChecklistItem = (index: number, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      contentChecklist: prev.contentChecklist.map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeChecklistItem = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      contentChecklist: prev.contentChecklist.filter((_, i) => i !== index),
    }));
  };

  const isCompleted = source === 'feedback';
  const showFullDetail = isCompleted;

  return (
    <Dialog open onClose={onClose} maxWidth="max-w-2xl">
      {showLoading ? (
        <>
          <DialogHeader onClose={onClose}>
            <h2 className="text-lg font-semibold text-foreground">과제 상세</h2>
          </DialogHeader>
          <div className="flex flex-1 items-center justify-center p-12">
            <p className="text-sm text-muted-foreground">과제 정보를 불러오는 중...</p>
          </div>
        </>
      ) : (
        <>
          <DialogHeader onClose={onClose}>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-white">
                {d.subject}
              </span>
              <span className="text-sm text-muted-foreground">{d.date}</span>
              {!isEditing && (onSave || (source === 'incomplete' && menteeId)) && (
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                  수정
                </button>
              )}
            </div>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {/* 제목, 목표 */}
            <div className="border-b border-border/50 pb-4">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    id="edit-title"
                    label="제목"
                    value={editForm.title}
                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  />
                  <Input
                    id="edit-goal"
                    label="목표"
                    value={editForm.goal}
                    onChange={(e) => setEditForm((p) => ({ ...p, goal: e.target.value }))}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground">{d.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">목표: {d.goal}</p>
                </>
              )}
            </div>

            {/* 완료된 과제만 탭 표시 */}
            {showFullDetail && !isEditing && (
              <div className="-mx-6 flex border-b border-border/50">
                <button
                  type="button"
                  className="border-b-2 border-foreground px-6 py-3 text-sm font-medium text-foreground"
                >
                  과제 정보
                </button>
                <button
                  type="button"
                  className="border-b-2 border-transparent px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  피드백
                </button>
              </div>
            )}

            {/* 과제 내용 */}
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">과제 내용</h3>
              {isEditing ? (
                <div className="space-y-3">
                  {editForm.contentChecklist.length > 0 ? (
                    <div className="space-y-2">
                      {editForm.contentChecklist.map((item, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={item}
                            onChange={(e) => updateChecklistItem(i, e.target.value)}
                            placeholder={`항목 ${i + 1}`}
                            className="flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeChecklistItem(i)}
                            className="rounded p-2 text-muted-foreground hover:bg-secondary hover:text-red-600"
                          >
                            <span className="text-sm">✕</span>
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={addChecklistItem}>
                          항목 추가
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditForm((p) => ({
                              ...p,
                              content: p.contentChecklist.join('\n'),
                              contentChecklist: [],
                            }))
                          }
                        >
                          텍스트로 전환
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={editForm.content}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, content: e.target.value }))
                        }
                        rows={4}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                        placeholder="과제 내용을 입력하세요"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditForm((p) => ({
                            ...p,
                            content: '',
                            contentChecklist: [''],
                          }))
                        }
                      >
                        체크리스트로 전환
                      </Button>
                    </>
                  )}
                </div>
              ) : d.contentChecklist && d.contentChecklist.length > 0 ? (
                <ul className="space-y-2">
                  {d.contentChecklist.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-foreground/80 prose-p:my-1 prose-ul:my-2"
                  dangerouslySetInnerHTML={{ __html: d.content }}
                />
              )}
            </div>

            {/* 미완료 과제: 과제 내용만 표시, 이하 생략 */}
            {showFullDetail && !isEditing && (
              <>
                {/* 관련 자료 태그 */}
                {d.relatedResources && d.relatedResources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {d.relatedResources.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className="rounded-lg border border-border/50 bg-white px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary/50"
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* 설스터디 칼럼 */}
                {d.studyColumn && (
                  <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <h3 className="text-sm font-semibold text-foreground">
                        {d.studyColumn.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{d.studyColumn.content}</p>
                    {d.studyColumn.readMoreLink && (
                      <a
                        href={d.studyColumn.readMoreLink}
                        className="mt-2 inline-block text-sm text-muted-foreground underline hover:text-foreground"
                      >
                        전체 읽기
                      </a>
                    )}
                  </div>
                )}

                {/* 학생 제출 사진 */}
                {d.studentPhotos.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">학생 제출 사진</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {d.studentPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-secondary"
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption ?? '제출 사진'}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 메모 */}
                {d.studentMemo && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">메모</h3>
                    <div className="rounded-xl border border-border/50 bg-white p-4">
                      <p className="text-sm text-muted-foreground">{d.studentMemo}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogBody>

          <DialogFooter>
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={cancelEdit}>
                  취소
                </Button>
                <Button size="sm" onClick={saveEdit}>
                  저장
                </Button>
              </>
            ) : isCompleted ? (
              feedbackStatus === 'completed' ? (
                <Link to={`/mentor/mentees/${menteeId}/feedback/${assignmentId}`}>
                  <Button variant="outline" size="sm" onClick={onClose}>
                    전체 피드백 보기
                  </Button>
                </Link>
              ) : menteeId ? (
                <Link to={`/mentor/mentees/${menteeId}/feedback/${assignmentId}`}>
                  <Button size="sm" onClick={onClose}>
                    피드백 작성하기
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" onClick={onClose}>
                  닫기
                </Button>
              )
            ) : (
              <Button variant="outline" size="sm" onClick={onClose}>
                닫기
              </Button>
            )}
          </DialogFooter>
        </>
      )}
    </Dialog>
  );
}

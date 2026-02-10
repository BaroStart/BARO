import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  Check,
  Copy,
  Edit2,
  Eye,
  File,
  FileText,
  FolderOpen,
  Image,
  Layers,
  Plus,
  Target,
  Trash2,
  Upload,
} from 'lucide-react';

import { fetchAssignmentMaterials } from '@/api/assignments';
import {
  createTemplate,
  deleteTemplate,
  fetchTemplateDetail,
  fetchTemplateList,
  updateTemplate,
} from '@/api/assignmentTemplates';
import { createLearningResource, fetchLearningResources } from '@/api/learningResources';
import { getSubjectEnum, getSubjectLabel } from '@/lib/subjectLabels';
import { uploadFileViaPreAuthenticatedUrl } from '@/lib/storageUpload';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { DefaultSelect } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { toast } from '@/components/ui/Toast';
import { ASSIGNMENT_TEMPLATES, type AssignmentTemplate } from '@/data/assignmentTemplates';
import { formatDateTime, getTodayDateStr } from '@/lib/dateUtils';
import {
  deleteMaterial,
  getMaterialBlob,
  type MaterialMeta,
} from '@/lib/materialStorage';
import type {
  AssignmentTemplateCreateReqSubjectEnum,
  AssignmentTemplateDetailRes,
  AssignmentTemplateListRes,
  LearningResourceCreateReqSubjectEnum,
  LearningResourceListItemRes,
} from '@/generated';

type TabType = 'materials' | 'goals' | 'templates';
const TABS = [
  { id: 'materials' as TabType, label: '학습 자료', icon: FolderOpen },
  { id: 'goals' as TabType, label: '과제 목표', icon: Target },
  // { id: 'templates' as TabType, label: '과제 템플릿', icon: Layers },
];

// TODO: API 연결 — localStorage 기반 커스텀 템플릿 저장을 서버 API로 교체
const STORAGE_KEY_TEMPLATES = 'assignment-template-storage-v1';

function loadCustomTemplates(): AssignmentTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t === 'object')
      .map((t) => t as Partial<AssignmentTemplate>)
      .map((t) => ({
        id: String(t.id ?? `tpl-custom-${Date.now()}`),
        title: String(t.title ?? ''),
        description: String(t.description ?? ''),
        variables: Array.isArray(t.variables) ? (t.variables as string[]).map(String) : undefined,
        checklist: Array.isArray(t.checklist) ? (t.checklist as string[]).map(String) : [],
        submitRule: t.submitRule != null ? String(t.submitRule) : undefined,
        source: 'custom' as const,
      }))
      .filter((t) => t.title.trim().length > 0 && t.checklist.length > 0);
  } catch {
    return [];
  }
}

function saveCustomTemplates(templates: AssignmentTemplate[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  } catch {
    // ignore
  }
}

export function AssignmentManagePage() {
  const [searchParams] = useSearchParams();

  // 탭 상태
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tab = searchParams.get('tab') as TabType | null;
    return tab && TABS.some((t) => t.id === tab) ? tab : 'materials';
  });

  // 학습 자료 상태
  const [materials, setMaterials] = useState<MaterialMeta[]>([]);
  const [materialFilter, setMaterialFilter] = useState({
    subject: '전체',
    search: '',
  });
  const [uploadModal, setUploadModal] = useState<{
    open: boolean;
    files: { file: File; meta: Partial<MaterialMeta> }[];
  }>({ open: false, files: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subjectSelectModal, setSubjectSelectModal] = useState(false);
  const [preSelectedSubject, setPreSelectedSubject] = useState<string>('국어');

  // 학습자료 미리보기 상태
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMeta, setPreviewMeta] = useState<MaterialMeta | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // 과제 목표 상태 (API 연동)
  const [goals, setGoals] = useState<AssignmentTemplateListRes[]>([]);
  const [goalSearch, setGoalSearch] = useState('');
  const [goalModal, setGoalModal] = useState<{
    open: boolean;
    editing: AssignmentTemplateDetailRes | null;
  }>({ open: false, editing: null });

  // 템플릿(커스텀) 상태
  const [customTemplates, setCustomTemplates] = useState<AssignmentTemplate[]>(() =>
    loadCustomTemplates(),
  );
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateDraft, setTemplateDraft] = useState({
    title: '',
    description: '',
    variables: '{DAY}',
    checklist: '',
    submitRule: '',
  });

  // 과제 목표 목록 새로고침 헬퍼
  const loadGoals = () => {
    fetchTemplateList()
      .then(setGoals)
      .catch(() => setGoals([]));
  };

  const loadMaterials = useCallback(() => {
    const assignmentPromise = fetchAssignmentMaterials()
      .then((apiMaterials): MaterialMeta[] =>
        apiMaterials.map((m) => ({
          id: `api-${m.assignmentId}`,
          title: m.assignmentTitle ?? m.fileName ?? '제목 없음',
          fileName: m.fileName ?? '',
          fileSize: '',
          fileType: (m.fileName?.endsWith('.pdf') ? 'pdf' : 'other') as MaterialMeta['fileType'],
          subject: getSubjectLabel(m.subject),
          subCategory: '',
          uploadedAt: '',
          source: 'seolstudy' as const,
          fileUrl: m.fileUrl ?? undefined,
        })),
      )
      .catch((): MaterialMeta[] => []);

    const learningPromise = fetchLearningResources()
      .then((resources): MaterialMeta[] =>
        resources.map((r) => {
          const bytes = r.fileSize ?? 0;
          const sizeStr =
            bytes >= 1024 * 1024
              ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
              : `${(bytes / 1024).toFixed(1)} KB`;
          return {
            id: `lr-${r.id}`,
            title: r.fileName ?? '제목 없음',
            fileName: r.fileName ?? '',
            fileSize: sizeStr,
            fileType: (r.fileName?.endsWith('.pdf') ? 'pdf' : 'other') as MaterialMeta['fileType'],
            subject: getSubjectLabel(r.subject),
            subCategory: '',
            uploadedAt: formatDateTime(r.createdAt),
            source: 'mentor' as const,
            fileUrl: r.fileUrl ?? undefined,
          };
        }),
      )
      .catch((): MaterialMeta[] => []);

    Promise.all([assignmentPromise, learningPromise]).then(
      ([assignmentMaterials, learningMaterials]) => {
        setMaterials([...learningMaterials, ...assignmentMaterials]);
      },
    );
  }, []);

  // 초기화 + URL 탭 동기화 (마운트 시 1회)
  useEffect(() => {
    loadMaterials();

    // 과제 목표(템플릿) 목록 조회
    loadGoals();

    const tab = searchParams.get('tab') as TabType | null;
    if (tab && TABS.some((t) => t.id === tab)) setActiveTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 파생 데이터
  const filteredGoals = useMemo(
    () =>
      goals.filter(
        (g) => !goalSearch || (g.name ?? '').toLowerCase().includes(goalSearch.toLowerCase()),
      ),
    [goals, goalSearch],
  );
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchSubject =
        materialFilter.subject === '전체' || m.subject === materialFilter.subject;
      const matchSearch =
        !materialFilter.search ||
        m.title.toLowerCase().includes(materialFilter.search.toLowerCase()) ||
        m.fileName.toLowerCase().includes(materialFilter.search.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [materials, materialFilter]);

  // 핸들러
  const handleSubjectSelect = (subject: string) => {
    setPreSelectedSubject(subject);
    setSubjectSelectModal(false);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadModal({
      open: true,
      files: files.map((file) => ({
        file,
        meta: {
          title: file.name,
          fileName: file.name,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          fileType: file.type.includes('pdf')
            ? 'pdf'
            : file.type.startsWith('image/')
              ? 'image'
              : 'document',
          subject: preSelectedSubject,
          subCategory: '기타',
          uploadedAt: getTodayDateStr(),
          source: 'mentor' as const,
        },
      })),
    });
    e.target.value = '';
  };

  const handleUploadConfirm = async (items: { file: File; meta: MaterialMeta }[]) => {
    for (const { file, meta } of items) {
      const subjectEnum = getSubjectEnum(meta.subject) as LearningResourceCreateReqSubjectEnum;
      const fileName = `learning-resources/${file.name}`;

      const { uploadUrl } = await uploadFileViaPreAuthenticatedUrl({ file, fileName });

      await createLearningResource({
        subject: subjectEnum,
        fileName: file.name,
        fileUrl: uploadUrl,
        fileSize: file.size,
      });
    }
    setUploadModal({ open: false, files: [] });
    loadMaterials();
  };

  const handleDeleteMaterial = async (material: MaterialMeta) => {
    if (!window.confirm(`"${material.title}" 자료를 삭제하시겠습니까?`)) return;
    await deleteMaterial(material.id);
    setMaterials((prev) => prev.filter((m) => m.id !== material.id));
  };

  const handleSaveGoal = async (req: {
    subject: string;
    name: string;
    learningResourceIds: number[];
  }) => {
    const subjectEnum = getSubjectEnum(req.subject) as AssignmentTemplateCreateReqSubjectEnum;
    try {
      if (goalModal.editing?.id != null) {
        await updateTemplate(goalModal.editing.id, {
          subject: subjectEnum,
          name: req.name,
          title: req.name,
          description: '',
          content: '',
          learningResourceIds: req.learningResourceIds,
        });
        toast.success('과제 목표가 수정되었습니다.');
      } else {
        await createTemplate({
          subject: subjectEnum,
          name: req.name,
          title: req.name,
          description: '',
          content: '',
          learningResourceIds: req.learningResourceIds,
        });
        toast.success('과제 목표가 추가되었습니다.');
      }
      setGoalModal({ open: false, editing: null });
      loadGoals();
    } catch {
      toast.error('저장에 실패했습니다.');
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!window.confirm('이 과제 목표를 삭제하시겠습니까?')) return;
    try {
      await deleteTemplate(id);
      toast.success('과제 목표가 삭제되었습니다.');
      loadGoals();
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleEditGoal = async (goalId: number) => {
    try {
      const detail = await fetchTemplateDetail(goalId);
      setGoalModal({ open: true, editing: detail });
    } catch {
      toast.error('상세 조회에 실패했습니다.');
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewMeta(null);
    setPreviewError(null);
    setPreviewLoading(false);
    setPreviewOpen(false);
  };

  const openPreview = async (meta: MaterialMeta) => {
    // reset
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewMeta(meta);
    setPreviewOpen(true);
    setPreviewLoading(true);

    try {
      const blob = await getMaterialBlob(meta.id);
      if (!blob) {
        setPreviewError('파일 데이터가 없어 미리보기를 할 수 없습니다.');
        return;
      }
      // 타입이 없는 경우가 있어도 objectURL로 대부분 렌더링 가능
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch {
      setPreviewError('미리보기를 불러오지 못했습니다.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCopyTemplate = async (tpl: AssignmentTemplate) => {
    const header = `# ${tpl.title}\n\n${tpl.description}\n`;
    const vars = tpl.variables?.length ? `\n[변수] ${tpl.variables.join(', ')}\n` : '';
    const checklist = `\n[체크리스트]\n${tpl.checklist.map((c) => `- ${c}`).join('\n')}\n`;
    const submit = tpl.submitRule ? `\n[제출 기준]\n- ${tpl.submitRule}\n` : '';
    const text = `${header}${vars}${checklist}${submit}`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success('템플릿 내용이 복사되었습니다.');
    } catch {
      // clipboard 권한 실패 시 안내
      toast.error('복사에 실패했습니다. 브라우저 권한을 확인해주세요.');
    }
  };

  const handleAddTemplate = () => {
    const title = templateDraft.title.trim();
    const description = templateDraft.description.trim();
    const checklist = templateDraft.checklist
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const variables = templateDraft.variables
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const submitRule = templateDraft.submitRule.trim();

    if (!title || checklist.length === 0) {
      toast.warning('제목과 체크리스트(최소 1개)는 필수입니다.');
      return;
    }

    const tpl: AssignmentTemplate = {
      id: `tpl-custom-${Date.now()}`,
      title,
      description,
      variables: variables.length ? variables : undefined,
      checklist,
      submitRule: submitRule || undefined,
      source: 'custom',
    };

    const next = [tpl, ...customTemplates];
    setCustomTemplates(next);
    saveCustomTemplates(next);
    setTemplateModalOpen(false);
    setTemplateDraft({
      title: '',
      description: '',
      variables: '{DAY}',
      checklist: '',
      submitRule: '',
    });
  };

  const handleDeleteCustomTemplate = (id: string) => {
    if (!window.confirm('이 템플릿을 삭제하시겠습니까?')) return;
    const next = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(next);
    saveCustomTemplates(next);
  };

  const allTemplates = useMemo<AssignmentTemplate[]>(
    () => [...customTemplates, ...ASSIGNMENT_TEMPLATES],
    [customTemplates],
  );

  const tabRightContent = (
    <div className="flex items-center gap-2">
      {activeTab === 'materials' && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => setSubjectSelectModal(true)}
          >
            <Upload className="h-3.5 w-3.5" />
            파일 업로드
          </Button>
        </>
      )}
      {activeTab === 'goals' && (
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setGoalModal({ open: true, editing: null })}
        >
          <Plus className="h-3.5 w-3.5" />새 과제 목표
        </Button>
      )}
      {activeTab === 'templates' && (
        <Button size="sm" className="gap-1.5" onClick={() => setTemplateModalOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          템플릿 추가
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-w-0">
      <div className="rounded-xl border border-border/50 bg-white">
        <div className="px-5 pt-1">
          <Tabs
            items={TABS}
            value={activeTab}
            onChange={setActiveTab}
            rightContent={tabRightContent}
          />
        </div>

        {activeTab === 'materials' && (
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <FilterTabs
                items={['전체', '국어', '영어', '수학'].map((s) => ({ id: s, label: s }))}
                value={materialFilter.subject}
                onChange={(subject) => setMaterialFilter((prev) => ({ ...prev, subject }))}
              />
              <SearchInput
                value={materialFilter.search}
                onChange={(search) => setMaterialFilter((prev) => ({ ...prev, search }))}
                placeholder="자료 검색..."
                className="w-48"
              />
              <p className="ml-auto text-xs text-muted-foreground">
                {filteredMaterials.length}개의 자료
              </p>
            </div>

            {subjectSelectModal && (
              <SubjectSelectModal
                onSelect={handleSubjectSelect}
                onClose={() => setSubjectSelectModal(false)}
              />
            )}

            {uploadModal.open && (
              <MaterialUploadModal
                pendingFiles={uploadModal.files}
                onClose={() => setUploadModal({ open: false, files: [] })}
                onConfirm={handleUploadConfirm}
              />
            )}

            {filteredMaterials.length === 0 ? (
              <EmptyState
                icon={<FolderOpen className="h-12 w-12" />}
                title={
                  materialFilter.search || materialFilter.subject !== '전체'
                    ? '검색 결과가 없습니다'
                    : '등록된 학습 자료가 없습니다'
                }
                description="파일을 업로드하여 과제에 활용하세요"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Upload}
                    onClick={() => setSubjectSelectModal(true)}
                  >
                    파일 업로드
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onPreview={() => openPreview(material)}
                    onDelete={() => handleDeleteMaterial(material)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                value={goalSearch}
                onChange={setGoalSearch}
                placeholder="과제 목표 검색..."
                className="w-48"
              />
              <p className="ml-auto text-xs text-muted-foreground">
                {filteredGoals.length}개의 목표
              </p>
            </div>

            {filteredGoals.length === 0 ? (
              <EmptyState
                icon={<Target className="h-12 w-12" />}
                title={goalSearch ? '검색 결과가 없습니다' : '등록된 과제 목표가 없습니다'}
                description="과제 목표를 추가하여 과제 등록 시 활용하세요"
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    onClick={() => setGoalModal({ open: true, editing: null })}
                  >
                    과제 목표 추가
                  </Button>
                }
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/50">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        {['과제 목표 이름', '과목', '추가자료', '관리'].map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left text-sm font-semibold text-foreground/60"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGoals.map((goal) => {
                        const subjectLabel = getSubjectLabel(goal.subject);
                        return (
                          <tr
                            key={goal.id}
                            className="group border-b border-border/50 transition-colors hover:bg-secondary/30"
                          >
                            <td className="px-4 py-3">
                              <p className="text-sm font-semibold text-foreground">{goal.name}</p>
                            </td>
                            <td className="px-4 py-3">
                              {subjectLabel && (
                                <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                                  {subjectLabel}
                                </span>
                              )}
                            </td>
                            <td className="max-w-[280px] px-4 py-3">
                              {(goal.fileNames?.length ?? 0) > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {goal.fileNames!.map((fileName, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center rounded-md border border-border/60 bg-secondary/50 px-2 py-0.5 text-[11px] text-foreground/60"
                                    >
                                      {fileName}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => goal.id != null && handleEditGoal(goal.id)}
                                  className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                  title="수정"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => goal.id != null && handleDeleteGoal(goal.id)}
                                  className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                  title="삭제"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {goalModal.open && (
              <LearningGoalModal
                goal={goalModal.editing}
                onSave={handleSaveGoal}
                onClose={() => setGoalModal({ open: false, editing: null })}
              />
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4 p-5">
            <div className="flex items-center">
              <p className="text-xs text-muted-foreground">{allTemplates.length}개의 템플릿</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-xl border border-border/50 bg-secondary/30 p-5 transition-all hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            tpl.source === 'custom'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-secondary text-foreground/50'
                          }`}
                        >
                          <Layers className="h-4 w-4" />
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            tpl.source === 'custom'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-secondary text-foreground/60'
                          }`}
                        >
                          {tpl.source === 'custom' ? '커스텀' : '예시'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{tpl.title}</p>
                      <p className="mt-1 text-xs text-foreground/60 line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-border/50 pt-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
                      체크리스트
                    </p>
                    <ul className="space-y-1.5">
                      {tpl.checklist.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                          <span className="leading-5">{c}</span>
                        </li>
                      ))}
                    </ul>
                    {tpl.submitRule && (
                      <div className="mt-3 rounded-md bg-secondary/70 px-2.5 py-2">
                        <p className="text-xs text-foreground/60">
                          <span className="font-medium text-foreground/70">제출 기준</span>{' '}
                          {tpl.submitRule}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/50 pt-3">
                    {tpl.source === 'custom' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomTemplate(tpl.id)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        title="삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Copy}
                      onClick={() => handleCopyTemplate(tpl)}
                    >
                      복사
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Dialog open={templateModalOpen} onClose={() => setTemplateModalOpen(false)}>
              <DialogHeader onClose={() => setTemplateModalOpen(false)}>
                <h2 className="text-lg font-semibold text-foreground">템플릿 추가</h2>
              </DialogHeader>
              <DialogBody className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground/80">제목</label>
                  <input
                    value={templateDraft.title}
                    onChange={(e) => setTemplateDraft((p) => ({ ...p, title: e.target.value }))}
                    placeholder="예: 영어단어 암기 Day {DAY}"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground/80">설명</label>
                  <input
                    value={templateDraft.description}
                    onChange={(e) =>
                      setTemplateDraft((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="예: Day별 단어 학습 + 테스트 + 오답 정리"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground/80">
                    변수(쉼표로 구분)
                  </label>
                  <input
                    value={templateDraft.variables}
                    onChange={(e) => setTemplateDraft((p) => ({ ...p, variables: e.target.value }))}
                    placeholder="{DAY}, {WEEK}"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground/80">
                    체크리스트(줄바꿈으로 항목 추가)
                  </label>
                  <textarea
                    value={templateDraft.checklist}
                    onChange={(e) => setTemplateDraft((p) => ({ ...p, checklist: e.target.value }))}
                    placeholder={'예: 단어 1회독\\n테스트 1회\\n오답노트 작성'}
                    rows={6}
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground/80">
                    제출 기준
                  </label>
                  <input
                    value={templateDraft.submitRule}
                    onChange={(e) =>
                      setTemplateDraft((p) => ({ ...p, submitRule: e.target.value }))
                    }
                    placeholder="예: 점수 + 오답 10개"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTemplateModalOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleAddTemplate}>추가</Button>
              </DialogFooter>
            </Dialog>
          </div>
        )}
      </div>

      <Dialog open={previewOpen} onClose={closePreview} maxWidth="max-w-5xl">
        <DialogHeader onClose={closePreview}>
          <h2 className="truncate text-base font-semibold text-foreground">학습 자료 미리보기</h2>
          <p className="mt-0.5 truncate text-sm text-foreground/60">{previewMeta?.title ?? ''}</p>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-secondary/50 p-4">
          {previewLoading && (
            <div className="flex min-h-[320px] items-center justify-center text-sm text-foreground/60">
              미리보기를 불러오는 중...
            </div>
          )}
          {!previewLoading && previewError && (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 text-sm text-foreground/60">
              <p>{previewError}</p>
              <p className="text-xs text-muted-foreground">
                설스터디 제공 자료는 목데이터만 있을 수 있어요.
              </p>
            </div>
          )}
          {!previewLoading && !previewError && previewMeta && previewUrl && (
            <div className="rounded-xl border border-border/50 bg-white p-3">
              {previewMeta.fileType === 'pdf' ? (
                <iframe title="pdf-preview" src={previewUrl} className="h-[70vh] w-full" />
              ) : previewMeta.fileType === 'image' ? (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt={previewMeta.title}
                    className="max-h-[70vh] object-contain"
                  />
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-foreground/60">
                  <p>이 파일 형식은 미리보기를 지원하지 않습니다.</p>
                  <a
                    href={previewUrl}
                    download={previewMeta.fileName}
                    className="rounded-lg border border-border bg-white px-4 py-2 text-sm text-foreground/80 hover:bg-secondary"
                  >
                    다운로드
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}

// 학습 자료 카드
function MaterialCard({
  material,
  onPreview,
  onDelete,
}: {
  material: MaterialMeta;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const FileIcon =
    material.fileType === 'pdf' ? FileText : material.fileType === 'image' ? Image : File;
  const isSeolstudy = material.source === 'seolstudy';

  return (
    <div
      className={`group relative rounded-lg border px-3 py-2.5 transition-all ${isSeolstudy ? 'border-blue-200 bg-blue-50/30 hover:shadow-soft' : 'border-border/50 bg-secondary/30 hover:shadow-soft'}`}
    >
      <div className="flex gap-2.5">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSeolstudy ? 'bg-blue-100 text-blue-600' : 'bg-secondary text-foreground/50'}`}
        >
          <FileIcon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <h3 className="text-[13px] font-semibold leading-snug text-foreground">
              {material.title}
            </h3>
            {isSeolstudy && (
              <span className="mt-0.5 shrink-0 rounded-full bg-blue-100 px-1.5 py-px text-[10px] font-medium text-blue-700">
                설스터디
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
            <span>{material.subject}</span>
            <span>·</span>
            <span>{material.fileSize}</span>
            <span>·</span>
            <span>{material.uploadedAt}</span>
          </div>
        </div>
      </div>
      <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onPreview}
          className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
          title="미리보기"
        >
          <Eye className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-red-50 hover:text-red-600"
          title="삭제"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// 과목 선택 모달
function SubjectSelectModal({
  onSelect,
  onClose,
}: {
  onSelect: (subject: string) => void;
  onClose: () => void;
}) {
  const subjects = ['국어', '영어', '수학'];

  return (
    <Dialog open onClose={onClose} maxWidth="max-w-md">
      <DialogHeader onClose={onClose}>
        <h2 className="text-lg font-semibold text-foreground">과목 선택</h2>
        <p className="mt-1 text-sm text-foreground/60">
          업로드할 학습 자료의 과목을 먼저 선택해주세요.
        </p>
      </DialogHeader>
      <DialogBody>
        <div className="grid grid-cols-3 gap-3">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => onSelect(subject)}
              className="rounded-lg border border-border/50 bg-white px-4 py-6 text-center transition-all hover:border-brand hover:bg-brand/5 hover:shadow-soft"
            >
              <p className="text-base font-semibold text-foreground">{subject}</p>
            </button>
          ))}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

// 업로드 모달
function MaterialUploadModal({
  pendingFiles,
  onClose,
  onConfirm,
}: {
  pendingFiles: { file: File; meta: Partial<MaterialMeta> }[];
  onClose: () => void;
  onConfirm: (items: { file: File; meta: MaterialMeta }[]) => Promise<void>;
}) {
  const [items, setItems] = useState(pendingFiles);
  const [saving, setSaving] = useState(false);

  const updateItem = (index: number, updates: Partial<MaterialMeta>) => {
    setItems((prev) =>
      prev.map((p, i) => (i === index ? { ...p, meta: { ...p.meta, ...updates } } : p)),
    );
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const validItems = items.map((p) => ({
        file: p.file,
        meta: {
          ...p.meta,
          subject: p.meta.subject || '국어',
          subCategory: '기타',
          title: p.meta.title || p.file.name,
          fileName: p.meta.fileName || p.file.name,
          fileSize: p.meta.fileSize || `${(p.file.size / 1024 / 1024).toFixed(2)} MB`,
          fileType: (p.meta.fileType || 'other') as MaterialMeta['fileType'],
          uploadedAt: p.meta.uploadedAt || getTodayDateStr(),
          source: 'mentor' as const,
        } as MaterialMeta,
      }));
      await onConfirm(validItems);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="max-w-2xl">
      <DialogHeader onClose={onClose}>
        <h2 className="text-lg font-semibold text-foreground">학습 자료 업로드</h2>
        <p className="mt-1 text-sm text-foreground/60">
          선택한 파일의 과목을 확인한 후 업로드하세요.
        </p>
      </DialogHeader>
      <DialogBody className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-border/50 p-4">
            <p className="mb-3 truncate text-sm font-medium text-foreground">{item.file.name}</p>
            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground/70">과목</label>
                <DefaultSelect
                  value={item.meta.subject || '국어'}
                  onValueChange={(subject) =>
                    updateItem(index, {
                      subject,
                      subCategory: '기타',
                    })
                  }
                  options={['국어', '영어', '수학']}
                />
              </div>
            </div>
          </div>
        ))}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button type="button" onClick={handleConfirm} disabled={saving}>
          {saving ? '업로드 중...' : '업로드'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}


// 과제 목표 모달
function LearningGoalModal({
  goal,
  onSave,
  onClose,
}: {
  goal: AssignmentTemplateDetailRes | null;
  onSave: (data: {
    subject: string;
    name: string;
    learningResourceIds: number[];
  }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(goal?.name || '');
  const [subject, setSubject] = useState(
    goal?.subject ? getSubjectLabel(goal.subject) : '국어',
  );

  // 학습자료 목록 (API)
  const [templateFiles, setTemplateFiles] = useState<LearningResourceListItemRes[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  const loadFiles = useCallback(() => {
    setFilesLoading(true);
    fetchLearningResources()
      .then(setTemplateFiles)
      .catch(() => setTemplateFiles([]))
      .finally(() => setFilesLoading(false));
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // 수정 시: 기존 파일 ID 목록으로 초기 선택 복원
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
    if (!goal?.files?.length) return new Set();
    return new Set(goal.files.map((f) => f.id).filter((id): id is number => id != null));
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ subject, name: name.trim(), learningResourceIds: Array.from(selectedIds) });
  };

  const toggleFile = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <h2 className="text-lg font-semibold text-foreground">
          {goal ? '과제 목표 수정' : '새 과제 목표 추가'}
        </h2>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/80">과목</label>
            <DefaultSelect
              value={subject}
              onValueChange={setSubject}
              options={['국어', '영어', '수학']}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/80">
              과제 목표 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 비문학 지문 구조 파악"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/80">추가자료</label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
              {filesLoading ? (
                <p className="p-4 text-center text-sm text-foreground/60">
                  학습자료를 불러오는 중...
                </p>
              ) : templateFiles.length === 0 ? (
                <p className="p-4 text-center text-sm text-foreground/60">
                  등록된 학습자료가 없습니다
                </p>
              ) : (
                <div className="divide-y divide-border/50">
                  {templateFiles.map((file) => {
                    const id = file.id;
                    if (id == null) return null;
                    return (
                      <label
                        key={id}
                        className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-secondary/50"
                      >
                        <Checkbox
                          checked={selectedIds.has(id)}
                          onCheckedChange={() => toggleFile(id)}
                        />
                        <div className="flex flex-1 items-center gap-2">
                          <span className="text-sm">{file.fileName}</span>
                          {file.subject && (
                            <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-foreground/60">
                              {getSubjectLabel(file.subject)}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit">{goal ? '수정' : '추가'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

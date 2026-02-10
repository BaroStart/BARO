import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import { Copy, FileText, FileUp, Save } from 'lucide-react';

import { registerAssignment } from '@/api/assignments';
import { fetchTemplateList } from '@/api/assignmentTemplates';
import { ColumnEditor } from '@/components/mentor/ColumnEditor';
import { LoadFromDateModal } from '@/components/mentor/LoadFromDateModal';
import { TempSaveListModal } from '@/components/mentor/TempSaveListModal';
import { WeekdaySelector } from '@/components/mentor/WeekdaySelector';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  DefaultSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { TimePicker } from '@/components/ui/time-picker';
import {
  MOCK_DRAFT_ASSIGNMENTS,
  MOTIVATIONAL_COLUMN_TEMPLATES,
  SUBJECT_COLUMN_TEMPLATES,
} from '@/data/assignmentRegisterMock';
import { MOCK_MENTEE_TASKS } from '@/data/menteeDetailMock';
import type { AssignmentTemplateListRes } from '@/generated';
import { useIncompleteAssignments, useMenteeKpi } from '@/hooks/useMenteeDetail';
import { useMentees } from '@/hooks/useMentees';
import { getTodayDateStr } from '@/lib/dateUtils';
import { uploadFileViaPreAuthenticatedUrl } from '@/lib/storageUpload';
import { getSubjectLabel } from '@/lib/subjectLabels';
import { cn } from '@/lib/utils';

const MAIN_SUBJECTS = ['국어', '영어', '수학'] as const;
type MainSubject = (typeof MAIN_SUBJECTS)[number];

interface FormState {
  menteeId: string;
  title: string;
  templateName: string;
  subject: MainSubject;
  improvementPointId: string;
  description: string;
  columnContent: string;
  motivationalTemplateId: string;
  dateMode: 'single' | 'recurring';
  singleDate: string;
  recurringDays: number[];
  recurringStartDate: string;
  recurringEndDate: string;
  recurringEndTime: string;
  singleEndTime: string;
}

const createInitialForm = (menteeId?: string): FormState => ({
  menteeId: menteeId ?? '',
  title: '',
  templateName: '',
  subject: '국어',
  improvementPointId: '',
  description: '',
  columnContent: '',
  motivationalTemplateId: '',
  dateMode: 'single',
  singleDate: getTodayDateStr(),
  recurringDays: [],
  recurringStartDate: getTodayDateStr(),
  recurringEndDate: getTodayDateStr(),
  recurringEndTime: '23:59',
  singleEndTime: '23:59',
});

export function AssignmentRegisterPage() {
  const { menteeId: urlMenteeId } = useParams<{ menteeId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 외부 데이터
  const { data: menteesData } = useMentees();
  const mentees = menteesData?.mentees ?? [];
  const { data: kpi } = useMenteeKpi(urlMenteeId);
  const [allGoals, setAllGoals] = useState<AssignmentTemplateListRes[]>([]);

  // 폼 상태 (하나의 객체로 관리)
  const [form, setForm] = useState<FormState>(() => createInitialForm(urlMenteeId));
  const { data: incompleteAssignments = [] } = useIncompleteAssignments(form.menteeId);
  const [editorKey, setEditorKey] = useState(0);
  const [descriptionKey, setDescriptionKey] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<
    { id: string; name: string; size: string; file: File }[]
  >([]);

  // UI 상태
  const [materialTab, setMaterialTab] = useState<'column' | 'pdf'>('column');
  const [activeModal, setActiveModal] = useState<'tempSave' | 'loadFromDate' | null>(null);
  const [loadMessage, setLoadMessage] = useState<'success' | 'empty' | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 초기화 + URL menteeId 동기화
  useEffect(() => {
    fetchTemplateList()
      .then(setAllGoals)
      .catch(() => setAllGoals([]));

    // location.state에서 편집할 과제 데이터 적용
    const editData = (location.state as { editAssignment?: Partial<FormState> })?.editAssignment;
    if (editData) {
      setForm((prev) => ({ ...prev, ...editData }));
      setEditorKey((k) => k + 1);
      navigate(location.pathname, { replace: true, state: {} });
    }

    // URL menteeId 동기화
    if (urlMenteeId && urlMenteeId !== form.menteeId) {
      setForm((prev) => ({ ...prev, menteeId: urlMenteeId }));
    }
  }, [urlMenteeId]);

  // 파생 데이터 (useMemo로 컴포넌트 내에서 계산)
  const learningGoals = useMemo(
    () => allGoals.filter((g) => getSubjectLabel(g.subject) === form.subject),
    [allGoals, form.subject],
  );
  const selectedMentee = mentees.find((m) => m.id === form.menteeId);
  const matchedFileNames = useMemo(() => {
    const goal = allGoals.find((g) => String(g.id) === form.improvementPointId);
    return goal?.fileNames ?? [];
  }, [form.improvementPointId, allGoals]);
  const highlightDates = useMemo(
    () =>
      form.menteeId
        ? [
            ...new Set(
              MOCK_MENTEE_TASKS.filter((t) => t.menteeId === form.menteeId).map((t) => t.date),
            ),
          ]
        : [],
    [form.menteeId],
  );

  // 폼 업데이트 헬퍼
  const updateForm = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyTemplate = useCallback((content: string) => {
    setForm((prev) => ({ ...prev, columnContent: content }));
    setEditorKey((k) => k + 1);
  }, []);

  // 과제 목표 선택 시 관련 데이터 자동 설정
  const handleGoalSelect = (goalId: string) => {
    const goal = allGoals.find((g) => String(g.id) === goalId);
    const subjectLabel = goal ? getSubjectLabel(goal.subject) : undefined;
    const formattedDescription = goal
      ? `<h3>오늘의 목표: ${goal.name}</h3>${goal.description ? `<p>${goal.description}</p>` : ''}`
      : '';

    setForm((prev) => ({
      ...prev,
      improvementPointId: goalId,
      motivationalTemplateId: '',
      templateName: goal?.name ?? prev.templateName,
      subject: (subjectLabel as MainSubject) ?? prev.subject,
      description: formattedDescription,
    }));
    setDescriptionKey((k) => k + 1);
    if (goal?.fileNames && goal.fileNames.length > 0) {
      setMaterialTab('pdf');
    }
  };

  // 이전 날짜에서 불러오기
  const handleLoadFromDate = (date: string) => {
    const tasks = MOCK_MENTEE_TASKS.filter((t) => t.menteeId === form.menteeId && t.date === date);
    if (tasks.length === 0) {
      setLoadMessage('empty');
    } else {
      const task = tasks[0];
      const subjectMap: Record<string, MainSubject> = {
        국어: '국어',
        영어: '영어',
        수학: '수학',
        과학: '수학',
        사회: '국어',
        자기주도: '국어',
      };
      const mapped = subjectMap[task.subject] ?? '국어';
      setForm((prev) => ({
        ...prev,
        title: task.title,
        templateName: `${task.subject} 학습`,
        subject: mapped,
      }));
      applyTemplate(
        `<h3>${task.title}</h3><p>과목: ${task.subject}</p>${SUBJECT_COLUMN_TEMPLATES[mapped] ?? ''}`,
      );
      setLoadMessage('success');
    }
    setTimeout(() => setLoadMessage(null), 3000);
  };

  // 임시저장에서 불러오기
  const handleLoadDraft = (draft: (typeof MOCK_DRAFT_ASSIGNMENTS)[number]) => {
    const mapped = (
      ['국어', '영어', '수학'].includes(draft.subject) ? draft.subject : '국어'
    ) as MainSubject;
    setForm((prev) => ({ ...prev, menteeId: draft.menteeId, title: draft.title, subject: mapped }));
    applyTemplate(SUBJECT_COLUMN_TEMPLATES[mapped] ?? '');
    setActiveModal(null);
  };

  // 파일 업로드
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadedFiles((prev) => [
      ...prev,
      ...Array.from(files).map((f) => ({
        id: `upload-${Date.now()}-${f.name}`,
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`,
        file: f,
      })),
    ]);
    e.target.value = '';
  };

  // 폼 검증
  const validateForm = (): string | null => {
    if (!form.menteeId || !form.title.trim()) return '대상 학생과 과제 제목을 입력해 주세요.';
    if (form.dateMode === 'single' && !form.singleDate) return '과제 날짜를 선택해 주세요.';
    if (form.dateMode === 'recurring') {
      if (!form.recurringDays.length) return '요일 반복 시 최소 1개 이상의 요일을 선택해 주세요.';
      if (!form.recurringStartDate || !form.recurringEndDate)
        return '시작일과 종료일을 선택해 주세요.';
      if (form.recurringStartDate > form.recurringEndDate)
        return '시작일이 종료일보다 늦을 수 없습니다.';
    }
    return null;
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setSubmitError(error);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // 파일 업로드
      let fileUrls: string[] | undefined;
      if (uploadedFiles.length > 0) {
        const uploads = await Promise.all(
          uploadedFiles.map((f) =>
            uploadFileViaPreAuthenticatedUrl({ file: f.file, fileName: `assignments/${f.name}` }),
          ),
        );
        fileUrls = uploads.map((u) => u.uploadUrl);
      }

      const result = await registerAssignment({
        menteeId: form.menteeId,
        dateMode: form.dateMode,
        singleDate: form.dateMode === 'single' ? form.singleDate : undefined,
        singleEndTime: form.dateMode === 'single' ? form.singleEndTime : undefined,
        recurringDays: form.dateMode === 'recurring' ? form.recurringDays : undefined,
        recurringStartDate: form.dateMode === 'recurring' ? form.recurringStartDate : undefined,
        recurringEndDate: form.dateMode === 'recurring' ? form.recurringEndDate : undefined,
        recurringEndTime: form.dateMode === 'recurring' ? form.recurringEndTime : undefined,
        title: form.title.trim(),
        templateName: form.templateName.trim(),
        subject: form.subject,
        content: form.description.trim() || undefined,
        seolStudyColumn: form.columnContent.trim() || undefined,
        fileUrls,
      });

      if (result.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['incompleteAssignments', form.menteeId] }),
          queryClient.invalidateQueries({ queryKey: ['mentees'] }),
          queryClient.invalidateQueries({ queryKey: ['submittedAssignments'] }),
        ]);
        navigate(form.menteeId ? `/mentor/mentees/${form.menteeId}` : '/mentor', {
          state: {
            registeredDate: form.dateMode === 'single' ? form.singleDate : form.recurringStartDate,
          },
        });
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '과제 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-12">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" icon={Save} onClick={() => setActiveModal('tempSave')}>
          임시저장 목록
        </Button>
        <Button
          variant="outline"
          icon={Copy}
          onClick={() => setActiveModal('loadFromDate')}
          disabled={!form.menteeId}
        >
          이전 날짜 계획 불러오기
        </Button>
      </div>

      {loadMessage && (
        <div
          className={cn(
            'rounded-lg px-4 py-3 text-sm',
            loadMessage === 'success' ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800',
          )}
        >
          {loadMessage === 'success'
            ? '해당 날짜의 계획을 불러왔습니다.'
            : '해당 날짜에 등록된 과제가 없습니다.'}
        </div>
      )}
      {submitError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{submitError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-xl border border-border/50 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="mb-5 text-lg font-semibold text-foreground">기본 정보</h2>
          <div className="grid items-start gap-6 sm:grid-cols-2">
            <div>
              <Label>대상 학생 선택</Label>
              <DefaultSelect
                value={form.menteeId}
                onValueChange={(v) => updateForm('menteeId', v)}
                placeholder="학생을 선택하세요"
                className="mt-1.5"
                options={mentees.map((m) => ({
                  value: m.id,
                  label: `${m.name} (${m.grade} · ${m.track})`,
                }))}
              />
            </div>

            <div>
              <Label>과제 날짜</Label>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {(['single', 'recurring'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateForm('dateMode', mode)}
                    className={cn(
                      'h-9 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors',
                      form.dateMode === mode
                        ? 'bg-foreground text-white'
                        : 'bg-secondary text-foreground/70 hover:bg-secondary/80',
                    )}
                  >
                    {mode === 'single' ? '단일 날짜' : '요일 반복'}
                  </button>
                ))}
              </div>
              {form.dateMode === 'single' && (
                <div className="mt-4 flex items-end gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium text-foreground/80">날짜</Label>
                    <DatePicker
                      value={form.singleDate}
                      onChange={(v) => updateForm('singleDate', v)}
                      placeholder="날짜 선택"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium text-foreground/80">종료 시간</Label>
                    <TimePicker
                      value={form.singleEndTime}
                      onChange={(v) => updateForm('singleEndTime', v)}
                    />
                  </div>
                </div>
              )}
              {form.dateMode === 'recurring' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-medium text-foreground/70">반복 요일</p>
                    <WeekdaySelector
                      value={form.recurringDays}
                      onChange={(v) => updateForm('recurringDays', v)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-medium text-foreground/80">시작일</Label>
                      <DatePicker
                        value={form.recurringStartDate}
                        onChange={(v) => updateForm('recurringStartDate', v)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-medium text-foreground/80">종료일</Label>
                      <DatePicker
                        value={form.recurringEndDate}
                        onChange={(v) => updateForm('recurringEndDate', v)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-sm font-medium text-foreground/80">종료 시간</Label>
                      <TimePicker
                        value={form.recurringEndTime}
                        onChange={(v) => updateForm('recurringEndTime', v)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedMentee && (
            <div className="mt-4 rounded-lg border border-dashed border-border/50 bg-secondary/30 p-4">
              <p className="text-sm font-medium text-foreground/80">학생 정보 요약</p>
              <ul className="mt-2 space-y-1 text-xs text-foreground/70">
                <li>현재 진도: 수학 - 미적분 2단원, 영어 - 독해 유형 2과</li>
                <li>최근 제출률: {kpi?.assignmentCompletionRate ?? 95}% (지난 20일 기준)</li>
                <li>평균 학습 시간: 4시간 30분/일</li>
              </ul>
              {incompleteAssignments.length > 0 && (
                <div className="mt-3 border-t border-border/30 pt-3">
                  <p className="text-xs font-medium text-foreground/80">미완료 과제</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-foreground/70">
                    {incompleteAssignments.map((a) => (
                      <li key={a.id}>
                        {a.title} ({a.subject}
                        {a.deadlineDate ? ` · ${a.deadlineDate}` : ''})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border/50 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="mb-6 text-lg font-semibold text-foreground">과제 상세 정보</h2>
          <div className="space-y-6">
            <Input
              label="과제 제목"
              placeholder="예: 2월 15일 수학 미적분 학습"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>과목 선택</Label>
                <DefaultSelect
                  value={form.subject}
                  onValueChange={(v) => {
                    setForm((prev) => ({
                      ...prev,
                      subject: v as MainSubject,
                      improvementPointId: '',
                    }));
                  }}
                  placeholder="과목을 선택하세요"
                  className="mt-1.5"
                  options={MAIN_SUBJECTS}
                />
              </div>
              <div>
                <Label>과제 목표 선택</Label>
                {learningGoals.length === 0 ? (
                  <div className="mt-1.5 rounded-md border border-border/50 p-3 text-center text-sm text-muted-foreground">
                    등록된 과제 목표가 없습니다.
                    <br />
                    <span className="text-xs text-muted-foreground">
                      과제 관리 &gt; 과제 목표에서 추가하세요
                    </span>
                  </div>
                ) : (
                  <DefaultSelect
                    value={form.improvementPointId}
                    onValueChange={handleGoalSelect}
                    placeholder="과제 목표를 선택하세요"
                    className="mt-1.5"
                    options={learningGoals.map((g) => ({
                      value: String(g.id),
                      label: g.fileNames?.length
                        ? `${g.name} (${g.fileNames.length}개 학습자료)`
                        : (g.name ?? ''),
                    }))}
                  />
                )}
              </div>
            </div>
            <div>
              <Label>과제 내용</Label>
              <div className="mt-1.5">
                <ColumnEditor
                  key={descriptionKey}
                  defaultValue={form.description}
                  onChange={(v) => updateForm('description', v)}
                  placeholder="과제 내용을 상세히 입력하세요. (예: 학습 범위, 세부 지시사항 등)"
                  minHeight="150px"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border/50 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">학습 자료</h2>
          <Tabs
            items={[
              { id: 'column' as const, label: '셀스터디 칼럼' },
              { id: 'pdf' as const, label: 'PDF 파일첨부' },
            ]}
            value={materialTab}
            onChange={setMaterialTab}
          />

          {materialTab === 'column' ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium text-foreground/70">
                  동기부여·학습법 칼럼 템플릿
                </p>
                <Select
                  value={form.motivationalTemplateId}
                  onValueChange={(id) => {
                    updateForm('motivationalTemplateId', id);
                    const t = MOTIVATIONAL_COLUMN_TEMPLATES.find((m) => m.id === id);
                    if (t) applyTemplate(t.content);
                  }}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="선택 안 함 (과제 목표/과목 템플릿 또는 직접 작성)" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      생활 습관 & 동기부여
                    </div>
                    {MOTIVATIONAL_COLUMN_TEMPLATES.filter(
                      (m) => m.category === '생활 습관&동기부여',
                    ).map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                    <div className="mt-1 border-t border-border/30 px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      국영수 공부법 시리즈
                    </div>
                    {MOTIVATIONAL_COLUMN_TEMPLATES.filter(
                      (m) => m.category === '국영수 공부법',
                    ).map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ColumnEditor
                key={editorKey}
                defaultValue={form.columnContent}
                onChange={(v) => updateForm('columnContent', v)}
                placeholder="학습 가이드 내용을 입력하세요."
                minHeight="280px"
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {matchedFileNames.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground/80">자동 매칭된 학습자료</p>
                  <div className="space-y-2">
                    {matchedFileNames.map((fileName, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                      >
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <p className="min-w-0 flex-1 truncate text-sm font-medium">{fileName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-2 text-sm font-medium text-foreground/80">추가 PDF 업로드</p>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-secondary/30 py-8 transition-colors hover:border-border hover:bg-secondary/50">
                  <FileUp className="h-10 w-10 text-muted-foreground" />
                  <span className="mt-2 text-sm text-muted-foreground">클릭하여 파일 업로드</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                    multiple
                  />
                </label>
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                      >
                        <span className="text-sm font-medium">{f.name}</span>
                        <span className="text-xs text-muted-foreground">{f.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <div className="flex justify-end gap-2">
          <Link to={form.menteeId ? `/mentor/mentees/${form.menteeId}` : '/mentor'}>
            <Button type="button" variant="outline">
              취소
            </Button>
          </Link>
          <Button type="submit" disabled={!form.menteeId || !form.title.trim() || isSubmitting}>
            {isSubmitting ? '등록 중...' : '과제 등록'}
          </Button>
        </div>
      </form>

      <LoadFromDateModal
        isOpen={activeModal === 'loadFromDate'}
        onClose={() => setActiveModal(null)}
        selectedDate={form.singleDate}
        highlightDates={highlightDates}
        onConfirm={handleLoadFromDate}
      />
      <TempSaveListModal
        isOpen={activeModal === 'tempSave'}
        onClose={() => setActiveModal(null)}
        drafts={MOCK_DRAFT_ASSIGNMENTS}
        onLoadDraft={handleLoadDraft}
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import {
  BarChart3,
  BookOpen,
  Calculator,
  Edit,
  Eye,
  FileText,
  Hexagon,
  Inbox,
  List,
  Plus,
  Trash2,
} from 'lucide-react';

import { fetchFeedbackListByMentor } from '@/api/feedback';
import {
  createFeedbackTemplate,
  deleteFeedbackTemplateById,
  fetchFeedbackTemplateDetail,
  fetchFeedbackTemplateList,
  updateFeedbackTemplate,
} from '@/api/feedbackTemplates';
import { LearningAnalyticsSection } from '@/components/mentor/LearningAnalyticsSection';
import { TemplateEditModal } from '@/components/mentor/TemplateEditModal';
import { TemplateViewModal } from '@/components/mentor/TemplateViewModal';
import { Button } from '@/components/ui/Button';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs } from '@/components/ui/tabs';
import type {
  FeedbackListItemRes,
  FeedbackTemplateCreateReqSubjectEnum,
  FeedbackTemplateListRes,
  FeedbackTemplateRes,
} from '@/generated';
import { formatDateTime } from '@/lib/dateUtils';
import { getSubjectEnum, getSubjectLabel } from '@/lib/subjectLabels';

type TabType = 'feedback' | 'templates' | 'analytics';

const SUBJECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  국어: BookOpen,
  영어: FileText,
  수학: Calculator,
  공통: Hexagon,
};

const FEEDBACK_TABLE_HEADERS = ['과제명', '과목', '멘티', '제출일', '마감', '관리'];
const TEMPLATE_TABLE_HEADERS = ['템플릿명', '과목', '미리보기', '생성일', '관리'];

export function FeedbackManagePage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('feedback');
  const [templates, setTemplates] = useState<FeedbackTemplateListRes[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackListItemRes[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>('전체');
  const [templateSearch, setTemplateSearch] = useState('');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<
    'all' | 'pending' | 'completed' | 'overdue'
  >('all');
  const [templateModal, setTemplateModal] = useState<
    | null
    | { mode: 'create' }
    | { mode: 'edit'; template: FeedbackTemplateRes }
    | { mode: 'view'; template: FeedbackTemplateRes }
  >(null);

  const loadTemplates = () => {
    fetchFeedbackTemplateList().then(setTemplates).catch(() => setTemplates([]));
  };
  const loadFeedbackList = () => {
    fetchFeedbackListByMentor().then(setFeedbackList).catch(() => setFeedbackList([]));
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType | null;
    if (tabParam && ['feedback', 'templates', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    loadTemplates();
    loadFeedbackList();
  }, [searchParams]);

  // API status → 필터 매핑
  const waitingItems = useMemo(
    () => feedbackList.filter((f) => f.status === 'WAITING'),
    [feedbackList],
  );
  const completedItems = useMemo(
    () => feedbackList.filter((f) => f.status === 'COMPLETED'),
    [feedbackList],
  );
  const deadlineItems = useMemo(
    () => feedbackList.filter((f) => f.status === 'DEADLINE'),
    [feedbackList],
  );

  const tabs = [
    { id: 'feedback' as TabType, label: '피드백 목록', icon: FileText },
    { id: 'templates' as TabType, label: '피드백 템플릿 관리', icon: List },
    { id: 'analytics' as TabType, label: '학습 리포트', icon: BarChart3 },
  ];

  const filteredTemplates = templates.filter((t) => {
    const label = getSubjectLabel(t.subject);
    const matchSubject = subjectFilter === '전체' || label === subjectFilter;
    const q = templateSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      (t.name ?? '').toLowerCase().includes(q) ||
      (t.preview ?? '').toLowerCase().includes(q);
    return matchSubject && matchSearch;
  });


  return (
    <div className="min-w-0">
      <div className="rounded-xl border border-border/50 bg-white">
        <div className="px-5 pt-1">
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={setActiveTab}
            rightContent={
              activeTab === 'templates' ? (
                <Button size="sm" icon={Plus} onClick={() => setTemplateModal({ mode: 'create' })}>
                  새 템플릿 추가
                </Button>
              ) : undefined
            }
          />
        </div>

        {activeTab === 'feedback' && (
          <FeedbackListTab
            feedbackStatusFilter={feedbackStatusFilter}
            onFilterChange={setFeedbackStatusFilter}
            waitingItems={waitingItems}
            completedItems={completedItems}
            deadlineItems={deadlineItems}
            allItems={feedbackList}
          />
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <FilterTabs
                items={['전체', '국어', '영어', '수학', '공통'].map((sub) => ({
                  id: sub,
                  label: sub,
                }))}
                value={subjectFilter}
                onChange={setSubjectFilter}
              />

              <SearchInput
                value={templateSearch}
                onChange={setTemplateSearch}
                placeholder="템플릿 검색..."
                className="w-56"
              />
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-border/50 py-8">
                <Inbox className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-foreground/60">
                  {templateSearch || subjectFilter !== '전체'
                    ? '검색 결과가 없습니다.'
                    : '등록된 템플릿이 없습니다.'}
                </p>
              </div>
            ) : (
            <div className="overflow-hidden rounded-xl border border-border/50">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      {TEMPLATE_TABLE_HEADERS.map((header) => (
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
                    {filteredTemplates.map((template) => {
                      const subjectLabel = getSubjectLabel(template.subject);
                      const SubjectIcon = SUBJECT_ICONS[subjectLabel] ?? Hexagon;
                      const handleView = async () => {
                        if (template.id == null) return;
                        const detail = await fetchFeedbackTemplateDetail(template.id);
                        if (detail) setTemplateModal({ mode: 'view', template: detail });
                      };
                      const handleEdit = async () => {
                        if (template.id == null) return;
                        const detail = await fetchFeedbackTemplateDetail(template.id);
                        if (detail) setTemplateModal({ mode: 'edit', template: detail });
                      };
                      const handleDelete = async () => {
                        if (template.id == null) return;
                        if (!window.confirm(`"${template.name}" 템플릿을 삭제하시겠습니까?`)) return;
                        await deleteFeedbackTemplateById(template.id);
                        loadTemplates();
                      };
                      return (
                        <tr
                          key={template.id}
                          className="group border-b border-border/50 transition-colors hover:bg-secondary/30"
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-foreground">{template.name}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground/70">
                              <SubjectIcon className="h-3.5 w-3.5" />
                              {subjectLabel}
                            </span>
                          </td>
                          <td className="max-w-[240px] px-4 py-3">
                            <p className="truncate text-sm text-foreground/60">
                              {template.preview}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground/50">
                            {formatDateTime(template.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={handleView}
                                className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                title="보기"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={handleEdit}
                                className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                                title="편집"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={handleDelete}
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
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-5">
            <LearningAnalyticsSection />
          </div>
        )}
      </div>

      {(templateModal?.mode === 'create' || templateModal?.mode === 'edit') && (
        <TemplateEditModal
          template={templateModal.mode === 'edit' ? templateModal.template : null}
          onClose={() => setTemplateModal(null)}
          onSave={async ({ name, subject, content }) => {
            const subjectEnum = getSubjectEnum(subject) as FeedbackTemplateCreateReqSubjectEnum;
            if (templateModal.mode === 'edit' && templateModal.template.id != null) {
              await updateFeedbackTemplate(templateModal.template.id, {
                name,
                subject: subjectEnum,
                content,
              });
            } else {
              await createFeedbackTemplate({ name, subject: subjectEnum, content });
            }
            setTemplateModal(null);
            loadTemplates();
          }}
        />
      )}

      {templateModal?.mode === 'view' && (
        <TemplateViewModal
          template={templateModal.template}
          onClose={() => setTemplateModal(null)}
        />
      )}
    </div>
  );
}

// 피드백 목록 탭 (API 연동)
function FeedbackListTab({
  feedbackStatusFilter,
  onFilterChange,
  waitingItems,
  completedItems,
  deadlineItems,
  allItems,
}: {
  feedbackStatusFilter: 'all' | 'pending' | 'completed' | 'overdue';
  onFilterChange: (v: 'all' | 'pending' | 'completed' | 'overdue') => void;
  waitingItems: FeedbackListItemRes[];
  completedItems: FeedbackListItemRes[];
  deadlineItems: FeedbackListItemRes[];
  allItems: FeedbackListItemRes[];
}) {
  const displayed = useMemo(() => {
    switch (feedbackStatusFilter) {
      case 'pending':
        return waitingItems;
      case 'completed':
        return completedItems;
      case 'overdue':
        return deadlineItems;
      default:
        return allItems;
    }
  }, [feedbackStatusFilter, waitingItems, completedItems, deadlineItems, allItems]);

  const statusBadge = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            완료
          </span>
        );
      case 'DEADLINE':
        return (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            마감
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            대기
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterTabs
          items={[
            { id: 'all' as const, label: `전체 (${allItems.length})` },
            { id: 'pending' as const, label: `대기 (${waitingItems.length})` },
            { id: 'completed' as const, label: `완료 (${completedItems.length})` },
            { id: 'overdue' as const, label: `마감 (${deadlineItems.length})` },
          ]}
          value={feedbackStatusFilter}
          onChange={onFilterChange}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="sticky top-0 bg-secondary/50">
              <tr className="border-b border-border">
                {FEEDBACK_TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="px-5 py-3 text-left text-sm font-semibold text-foreground/60"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((item) => {
                const subjectLabel = getSubjectLabel(item.subject);
                const SubjectIcon = SUBJECT_ICONS[subjectLabel] ?? Hexagon;
                const isCompleted = item.status === 'COMPLETED';
                return (
                  <tr
                    key={item.assignmentId}
                    className="border-b border-border/50 transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-5 py-3 text-sm font-semibold text-foreground">
                      {item.assignmentTitle ?? '과제'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground/70">
                        <SubjectIcon className="h-3.5 w-3.5" />
                        {subjectLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground/70">
                      {item.menteeName ?? '-'}
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground/50">
                      {formatDateTime(item.submittedAt)}
                    </td>
                    <td className="px-5 py-3">{statusBadge(item.status)}</td>
                    <td className="px-5 py-3">
                      {isCompleted ? (
                        <Link to={`/mentor/feedback/${item.assignmentId}`}>
                          <Button size="sm" variant="outline">
                            보기 / 수정
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/mentor/feedback/${item.assignmentId}`}>
                          <Button size="sm">피드백 작성</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayed.length === 0 && (() => {
          const emptyText = {
            all: '피드백이 없습니다.',
            pending: '대기 중인 피드백이 없습니다.',
            completed: '완료된 피드백이 없습니다.',
            overdue: '마감된 피드백이 없습니다.',
          }[feedbackStatusFilter];
          return (
            <div className="flex min-h-[200px] flex-col items-center justify-center py-8">
              <Inbox className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-foreground/60">{emptyText}</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';

import { Download, FileText } from 'lucide-react';

import {
  EmptyState,
  KpiSummary,
  MenteeSelector,
  ReportHeader,
  StudyStyleSection,
  SubjectAnalysisSection,
  SubjectStudyTimesChart,
  TotalEvaluationSection,
  WeeklyPatternsChart,
} from '@/components/mentor/analyticsReport';
import { Button } from '@/components/ui/Button';
import { type AnalysisType, useComputedAnalysis } from '@/hooks/useComputedAnalysis';
import { useSubjectStudyTimes, useWeeklyPatterns } from '@/hooks/useLearningAnalysis';
import { useFeedbackItems, useIncompleteAssignments, useMenteeKpi } from '@/hooks/useMenteeDetail';
import { useMentees } from '@/hooks/useMentees';
import { exportToPdf, exportToWord } from '@/lib/reportExport';

type EditingState = {
  section: 'overall' | 'subject' | 'guidance' | null;
  data: Partial<AnalysisType> | null;
};

export function LearningAnalyticsSection() {
  const [selectedMenteeId, setSelectedMenteeId] = useState('');
  const [editing, setEditing] = useState<EditingState>({ section: null, data: null });
  const [analysis, setAnalysis] = useState<AnalysisType | null>(null);

  const { data: menteesData } = useMentees();
  const mentees = menteesData?.mentees ?? [];
  const { data: kpi } = useMenteeKpi(selectedMenteeId || undefined);
  const selectedMentee = mentees.find((m) => m.id === selectedMenteeId);

  const { data: feedbackItems = [] } = useFeedbackItems(selectedMenteeId || undefined);
  const { data: incompleteAssignments = [] } = useIncompleteAssignments(
    selectedMenteeId || undefined,
  );
  const { data: subjectStudyTimes = [] } = useSubjectStudyTimes(selectedMenteeId || undefined);
  const { data: weeklyPatterns = [] } = useWeeklyPatterns(selectedMenteeId || undefined);

  const computedAnalysis = useComputedAnalysis({
    menteeId: selectedMenteeId,
    kpi,
    feedbackItems,
    incompleteAssignments,
    subjectStudyTimes,
    weeklyPatterns,
  });

  useEffect(() => {
    if (computedAnalysis) {
      setAnalysis(computedAnalysis);
      setEditing({ section: null, data: null });
    } else {
      setAnalysis(null);
    }
  }, [computedAnalysis]);

  const displayAnalysis = useMemo(
    () => (editing.data && editing.section ? { ...analysis!, ...editing.data } : analysis),
    [analysis, editing],
  );

  const startEditing = (section: EditingState['section']) => {
    if (!displayAnalysis) return;
    setEditing({
      section,
      data: {
        overallAnalysis:
          section === 'overall'
            ? { ...displayAnalysis.overallAnalysis }
            : displayAnalysis.overallAnalysis,
        subjectDetailedAnalysis:
          section === 'subject'
            ? { ...displayAnalysis.subjectDetailedAnalysis }
            : displayAnalysis.subjectDetailedAnalysis,
        overallGuidance:
          section === 'guidance'
            ? [...displayAnalysis.overallGuidance]
            : displayAnalysis.overallGuidance,
      },
    });
  };

  const saveEditing = () => {
    if (!analysis || !editing.data) return;
    const { section, data } = editing;
    if (section === 'overall' && data.overallAnalysis) {
      setAnalysis({ ...analysis, overallAnalysis: data.overallAnalysis });
    } else if (section === 'subject' && data.subjectDetailedAnalysis) {
      setAnalysis({ ...analysis, subjectDetailedAnalysis: data.subjectDetailedAnalysis });
    } else if (section === 'guidance' && data.overallGuidance) {
      setAnalysis({ ...analysis, overallGuidance: data.overallGuidance });
    }
    setEditing({ section: null, data: null });
  };

  const cancelEditing = () => setEditing({ section: null, data: null });

  const updateEditingData = (partial: Partial<AnalysisType>) => {
    setEditing((prev) => ({ ...prev, data: { ...prev.data, ...partial } }));
  };

  const handlePdfDownload = async () => {
    if (editing.section) {
      alert('편집 모드를 종료한 후 PDF를 다운로드해주세요.');
      return;
    }
    const reportContent = document.getElementById('analysis-report');
    if (!reportContent) return;
    try {
      await exportToPdf({
        reportElement: reportContent,
        menteeName: selectedMentee?.name || '학생',
      });
    } catch (err) {
      console.error(err);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  const handleWordDownload = async () => {
    if (!selectedMentee || !displayAnalysis || !kpi) return;
    try {
      await exportToWord({
        mentee: selectedMentee,
        kpi,
        analysis: displayAnalysis,
        weeklyPatterns,
        subjectStudyTimes,
      });
    } catch (err) {
      console.error(err);
      alert('Word 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <MenteeSelector
        mentees={mentees}
        selectedMenteeId={selectedMenteeId}
        onSelect={setSelectedMenteeId}
      />

      {selectedMenteeId && analysis && displayAnalysis ? (
        <>
          <div className="flex justify-end gap-2">
            <Button onClick={handlePdfDownload} className="no-print" icon={Download}>
              PDF 다운로드
            </Button>
            <Button
              onClick={handleWordDownload}
              variant="outline"
              className="no-print"
              icon={FileText}
            >
              Word 다운로드
            </Button>
          </div>

          <div
            id="analysis-report"
            className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-8 shadow-lg"
          >
            <ReportHeader mentee={selectedMentee} />
            <KpiSummary kpi={kpi} />
            <WeeklyPatternsChart weeklyPatterns={weeklyPatterns} />
            <SubjectStudyTimesChart subjectStudyTimes={subjectStudyTimes} />

            <StudyStyleSection
              displayAnalysis={displayAnalysis}
              isEditing={editing.section === 'overall'}
              editedData={editing.data?.overallAnalysis}
              onEdit={() => startEditing('overall')}
              onSave={saveEditing}
              onCancel={cancelEditing}
              onUpdate={(overallAnalysis) => updateEditingData({ overallAnalysis })}
            />

            <SubjectAnalysisSection
              displayAnalysis={displayAnalysis}
              isEditing={editing.section === 'subject'}
              editedData={editing.data?.subjectDetailedAnalysis}
              onEdit={() => startEditing('subject')}
              onSave={saveEditing}
              onCancel={cancelEditing}
              onUpdate={(subjectDetailedAnalysis) => updateEditingData({ subjectDetailedAnalysis })}
            />

            <TotalEvaluationSection
              displayAnalysis={displayAnalysis}
              isEditing={editing.section === 'guidance'}
              editedData={editing.data?.overallGuidance}
              onEdit={() => startEditing('guidance')}
              onSave={saveEditing}
              onCancel={cancelEditing}
              onUpdate={(overallGuidance) => updateEditingData({ overallGuidance })}
            />
          </div>
        </>
      ) : selectedMenteeId ? (
        <EmptyState message="데이터를 불러오는 중..." />
      ) : (
        <EmptyState message="멘티를 선택하면 학습 스타일, 강점, 약점, 개선점을 분석해드립니다." />
      )}
    </div>
  );
}

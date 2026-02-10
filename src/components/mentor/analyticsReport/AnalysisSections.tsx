import type { AnalysisType } from '@/hooks/useComputedAnalysis';

import { EditButtons, TagList, TextareaField } from './EditingControls';

interface SectionProps<T> {
  displayAnalysis: AnalysisType;
  isEditing: boolean;
  editedData: T | undefined;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onUpdate: (data: T) => void;
}

export function StudyStyleSection({
  displayAnalysis,
  isEditing,
  editedData,
  onEdit,
  onSave,
  onCancel,
  onUpdate,
}: SectionProps<AnalysisType['overallAnalysis']>) {
  const data = displayAnalysis.overallAnalysis;
  if (!data || data.summary.length === 0) return null;

  const handleTextChange = (
    field: keyof typeof data,
    value: string,
    separator: ',' | '\n' = '\n',
  ) => {
    if (!editedData) return;
    onUpdate({
      ...editedData,
      [field]: value
        .split(separator)
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="mb-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div className="mb-3 flex items-center justify-between border-b-2 border-slate-200 pb-2">
        <h2 className="text-base font-bold text-slate-900">전반적인 학습 태도 및 공부 스타일</h2>
        <EditButtons isEditing={isEditing} onEdit={onEdit} onSave={onSave} onCancel={onCancel} />
      </div>

      {isEditing && editedData ? (
        <div className="space-y-4">
          <TextareaField
            label="요약"
            value={editedData.summary.join('\n')}
            rows={4}
            onChange={(v) => handleTextChange('summary', v)}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextareaField
              label="장점 (쉼표로 구분)"
              value={editedData.strengths.join(', ')}
              rows={2}
              onChange={(v) => handleTextChange('strengths', v, ',')}
            />
            <TextareaField
              label="약점 (쉼표로 구분)"
              value={editedData.weaknesses.join(', ')}
              rows={2}
              onChange={(v) => handleTextChange('weaknesses', v, ',')}
            />
          </div>
          <TextareaField
            label="지도 포인트 (쉼표로 구분)"
            value={editedData.guidancePoints.join(', ')}
            rows={2}
            onChange={(v) => handleTextChange('guidancePoints', v, ',')}
          />
        </div>
      ) : (
        <>
          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
            {data.summary.map((text, idx) => (
              <p key={idx}>{text}</p>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {data.strengths.length > 0 && <TagList title="장점" items={data.strengths} />}
            {data.weaknesses.length > 0 && <TagList title="약점" items={data.weaknesses} />}
          </div>
          {data.guidancePoints.length > 0 && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="mb-1 text-xs font-semibold text-slate-700">지도 포인트</p>
              <p className="text-sm text-slate-800">{data.guidancePoints.join(', ')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface SubjectData {
  studyStyle: string[];
  weakAreas: string[];
  mistakeTypes: string[];
  guidanceDirection: string[];
}

export function SubjectAnalysisSection({
  displayAnalysis,
  isEditing,
  editedData,
  onEdit,
  onSave,
  onCancel,
  onUpdate,
}: SectionProps<AnalysisType['subjectDetailedAnalysis']>) {
  const data = displayAnalysis.subjectDetailedAnalysis;
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="mb-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <div className="mb-3 flex items-center justify-between border-b-2 border-slate-200 pb-2">
        <h2 className="text-base font-bold text-slate-900">과목별 상세 분석</h2>
        <EditButtons isEditing={isEditing} onEdit={onEdit} onSave={onSave} onCancel={onCancel} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(data).map(([subject, details]) => (
          <div
            key={subject}
            className="rounded-lg border border-slate-200 bg-white p-4"
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
          >
            <h3 className="mb-3 text-sm font-bold text-slate-900">{subject} 과목 분석</h3>
            {isEditing && editedData ? (
              <SubjectEditForm
                data={editedData[subject]}
                onUpdate={(newData) => onUpdate({ ...editedData, [subject]: newData })}
              />
            ) : (
              <SubjectDisplay data={details} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TotalEvaluationSection({
  displayAnalysis,
  isEditing,
  editedData,
  onEdit,
  onSave,
  onCancel,
  onUpdate,
}: SectionProps<string[]>) {
  const data = displayAnalysis.overallGuidance;
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-lg border-2 border-slate-300 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">종합 평가 및 상담 마무리 멘트</h2>
        <EditButtons isEditing={isEditing} onEdit={onEdit} onSave={onSave} onCancel={onCancel} />
      </div>
      {isEditing && editedData ? (
        <textarea
          value={editedData.join('\n')}
          onChange={(e) => onUpdate(e.target.value.split('\n').filter((t) => t.trim()))}
          rows={6}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      ) : (
        <div className="space-y-2 text-sm leading-relaxed text-slate-700">
          {data.map((g, idx) => (
            <p key={idx}>{g}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function SubjectEditForm({
  data,
  onUpdate,
}: {
  data: SubjectData;
  onUpdate: (d: SubjectData) => void;
}) {
  const fields: { key: keyof SubjectData; label: string }[] = [
    { key: 'studyStyle', label: '학습 스타일' },
    { key: 'weakAreas', label: '취약한 부분' },
    { key: 'mistakeTypes', label: '실수 유형' },
    { key: 'guidanceDirection', label: '지도 방향' },
  ];

  return (
    <div className="space-y-3">
      {fields.map(({ key, label }) => (
        <div key={key}>
          <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
          <textarea
            value={data?.[key]?.join('\n') || ''}
            onChange={(e) =>
              onUpdate({ ...data, [key]: e.target.value.split('\n').filter((t) => t.trim()) })
            }
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs"
          />
        </div>
      ))}
    </div>
  );
}

function SubjectDisplay({ data }: { data: SubjectData }) {
  const sections: { key: keyof SubjectData; label: string; bullet?: boolean }[] = [
    { key: 'studyStyle', label: '학습 스타일' },
    { key: 'weakAreas', label: '취약한 부분', bullet: true },
    { key: 'mistakeTypes', label: '실수 유형' },
    { key: 'guidanceDirection', label: '지도 방향' },
  ];

  return (
    <>
      {sections.map(({ key, label, bullet }) =>
        data[key]?.length > 0 ? (
          <div key={key} className="mb-3 last:mb-0">
            <p className="mb-1 text-xs font-semibold text-slate-600">{label}</p>
            {bullet ? (
              <ul className="space-y-0.5">
                {data[key].map((item, i) => (
                  <li key={i} className="text-xs text-slate-700">
                    • {item}
                  </li>
                ))}
              </ul>
            ) : (
              data[key].map((item, i) => (
                <p key={i} className="text-xs leading-relaxed text-slate-700">
                  {item}
                </p>
              ))
            )}
          </div>
        ) : null,
      )}
    </>
  );
}

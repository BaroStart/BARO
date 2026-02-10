import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { getGradeLabel } from '@/lib/gradeLabels';
import type {
  MenteeScores,
  MenteeSummary,
  MockExamPeriodScores,
  NaesinPeriodScores,
} from '@/types';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentee: MenteeSummary | undefined;
  mentorSubject?: '국어' | '영어' | '수학';
  onSave: (data: Partial<MenteeSummary>) => void;
}

const SUBJECT_TO_KEY: Record<string, 'korean' | 'english' | 'math'> = {
  국어: 'korean',
  영어: 'english',
  수학: 'math',
};

const NAESIN_KEYS = ['midterm1', 'final1', 'midterm2', 'final2'] as const;
const NAESIN_LABELS = ['1학기 중간', '1학기 기말', '2학기 중간', '2학기 기말'];
const MOCK_EXAM_KEYS = ['march', 'june', 'september', 'november'] as const;
const MOCK_EXAM_LABELS = ['3월', '6월', '9월', '11월'];

function numberToString(v: number | undefined): string {
  return v != null ? String(v) : '';
}

function stringToNumber(s: string): number | undefined {
  const n = parseFloat(s);
  return s.trim() && !Number.isNaN(n) ? n : undefined;
}

const emptyNaesin = (): NaesinPeriodScores => ({});
const emptyMockExam = (): MockExamPeriodScores => ({});

export function ProfileEditModal({
  isOpen,
  onClose,
  mentee,
  mentorSubject = '국어',
  onSave,
}: ProfileEditModalProps) {
  const [name, setName] = useState(mentee?.name ?? '');
  const [school, setSchool] = useState(mentee?.school ?? '');
  const [grade, setGrade] = useState(mentee?.grade ?? '');
  const [track, setTrack] = useState<MenteeSummary['track']>(mentee?.track ?? '이과');
  const [desiredMajor, setDesiredMajor] = useState(mentee?.desiredMajor ?? '');
  const [memo, setMemo] = useState(mentee?.memo ?? '');

  const subjectKey = SUBJECT_TO_KEY[mentorSubject];
  const [naesin, setNaesin] = useState<NaesinPeriodScores>(emptyNaesin());
  const [mockExam, setMockExam] = useState<MockExamPeriodScores>(emptyMockExam());

  const setNaesinScore = (key: (typeof NAESIN_KEYS)[number], value: string) => {
    setNaesin((prev) => ({ ...prev, [key]: stringToNumber(value) }));
  };
  const setMockExamScore = (key: (typeof MOCK_EXAM_KEYS)[number], value: string) => {
    setMockExam((prev) => ({ ...prev, [key]: stringToNumber(value) }));
  };

  const getInitialNaesin = () =>
    (mentee?.scores?.naesin?.[subjectKey] as NaesinPeriodScores | undefined) ?? emptyNaesin();
  const getInitialMockExam = () =>
    (mentee?.scores?.mockExam?.[subjectKey] as MockExamPeriodScores | undefined) ?? emptyMockExam();


  useEffect(() => {
    if (isOpen && mentee) {
      setName(mentee.name);
      setSchool(mentee.school);
      setGrade(mentee.grade);
      setTrack(mentee.track);
      setDesiredMajor(mentee.desiredMajor ?? '');
      setMemo(mentee.memo ?? '');
      setNaesin(getInitialNaesin());
      setMockExam(getInitialMockExam());
    }
  }, [isOpen, mentee, subjectKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasNaesin = NAESIN_KEYS.some((k) => naesin[k] != null);
    const hasMockExam = MOCK_EXAM_KEYS.some((k) => mockExam[k] != null);
    const scores: MenteeScores = { ...mentee?.scores };
    if (hasNaesin) {
      scores.naesin = { ...mentee?.scores?.naesin, [subjectKey]: naesin };
    }
    if (hasMockExam) {
      scores.mockExam = { ...mentee?.scores?.mockExam, [subjectKey]: mockExam };
    }
    onSave({
      name,
      school,
      grade,
      track,
      desiredMajor: desiredMajor || undefined,
      memo: memo.trim() || undefined,
      scores: hasNaesin || hasMockExam ? scores : mentee?.scores,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">프로필 수정</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="profile-name"
            label="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled
          />
          <Input
            id="profile-school"
            label="학교"
            value={school}
            placeholder="예: 서울 소재 일반고"
            disabled
          />
          <Input
            id="profile-grade"
            label="학년"
            value={getGradeLabel(grade) || grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="예: 고3"
            disabled
          />
          <div className="space-y-2">
            <Label htmlFor="profile-track">계열</Label>
            <select
              id="profile-track"
              value={track}
              onChange={(e) => setTrack(e.target.value as MenteeSummary['track'])}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="이과">이과</option>
              <option value="문과">문과</option>
            </select>
          </div>
          <Input
            id="profile-major"
            label="희망 진로"
            value={desiredMajor}
            onChange={(e) => setDesiredMajor(e.target.value)}
            placeholder="예: 의학계열"
          />

          {/* 내신 성적 (담당 과목만) */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
            <Label className="mb-2 block text-sm font-medium text-slate-700">
              내신 ({mentorSubject}) - 중간/기말
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {NAESIN_KEYS.map((key, i) => (
                <div key={key}>
                  <Label htmlFor={`naesin-${key}`} className="text-xs text-slate-500">
                    {NAESIN_LABELS[i]}
                  </Label>
                  <Input
                    id={`naesin-${key}`}
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={numberToString(naesin[key])}
                    onChange={(e) => setNaesinScore(key, e.target.value)}
                    placeholder="-"
                    className="mt-0.5"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 모의고사 성적 (담당 과목만) */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
            <Label className="mb-2 block text-sm font-medium text-slate-700">
              모의고사 ({mentorSubject}) - 3/6/9/11월
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {MOCK_EXAM_KEYS.map((key, i) => (
                <div key={key}>
                  <Label htmlFor={`mock-${key}`} className="text-xs text-slate-500">
                    {MOCK_EXAM_LABELS[i]}
                  </Label>
                  <Input
                    id={`mock-${key}`}
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={numberToString(mockExam[key])}
                    onChange={(e) => setMockExamScore(key, e.target.value)}
                    placeholder="-"
                    className="mt-0.5"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 학생 메모 */}
          <div className="space-y-2">
            <Label htmlFor="profile-memo" className="text-sm font-medium text-slate-700">
              학생 메모
            </Label>
            <textarea
              id="profile-memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="학생에 대한 메모를 입력하세요"
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">저장</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import {
  AlignmentType,
  Document,
  HeadingLevel,
  type IParagraphOptions,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

import type { AnalysisType } from '@/hooks/useComputedAnalysis';
import type { DailyStudyPattern, SubjectStudyTime } from '@/types/learning';
import type { MenteeSummary } from '@/types/mentee';
import type { MenteeKpi } from '@/types/menteeDetail';

interface ExportPdfParams {
  reportElement: HTMLElement;
  menteeName: string;
}

export async function exportToPdf({ reportElement, menteeName }: ExportPdfParams): Promise<void> {
  const clonedContent = reportElement.cloneNode(true) as HTMLElement;

  clonedContent.querySelectorAll('button').forEach((btn) => btn.remove());
  clonedContent.querySelectorAll('svg').forEach((svg) => svg.remove());
  clonedContent.querySelectorAll('textarea').forEach((textarea) => {
    const text = (textarea as HTMLTextAreaElement).value || textarea.textContent || '';
    const lines = text.split('\n').filter((l) => l.trim());
    const parent = textarea.parentElement;
    if (parent) {
      const div = document.createElement('div');
      div.className = 'text-sm leading-relaxed text-slate-700';
      lines.forEach((line) => {
        const p = document.createElement('p');
        p.textContent = line;
        p.style.marginBottom = '0.5rem';
        div.appendChild(p);
      });
      parent.replaceChild(div, textarea);
    }
  });
  clonedContent.querySelectorAll('input, textarea, select').forEach((el) => el.remove());

  const temp = document.createElement('div');
  temp.style.cssText = 'position:absolute;left:-9999px;top:0';
  temp.style.width = clonedContent.scrollWidth + 'px';
  temp.appendChild(clonedContent);
  document.body.appendChild(temp);

  await new Promise((r) => setTimeout(r, 100));

  try {
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `학생분석리포트_${menteeName}_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: clonedContent.scrollWidth,
          windowHeight: clonedContent.scrollHeight,
          allowTaint: true,
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      })
      .from(clonedContent)
      .save();
  } finally {
    if (document.body.contains(temp)) document.body.removeChild(temp);
  }
}

interface ExportWordParams {
  mentee: MenteeSummary;
  kpi: MenteeKpi;
  analysis: AnalysisType;
  weeklyPatterns: DailyStudyPattern[];
  subjectStudyTimes: SubjectStudyTime[];
}

export async function exportToWord({
  mentee,
  kpi,
  analysis,
  weeklyPatterns,
  subjectStudyTimes,
}: ExportWordParams): Promise<void> {
  const children: IParagraphOptions[] = [];

  children.push({
    text: '학생 학습 분석 리포트',
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.LEFT,
    spacing: { after: 200 },
  });

  children.push({
    children: [
      new TextRun({ text: `학생명: ${mentee.name}`, bold: true }),
      new TextRun({ text: ` | 학년: ${mentee.grade} | 과정: ${mentee.track}` }),
    ],
    spacing: { after: 100 },
  });

  children.push({
    text: `작성일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    spacing: { after: 400 },
  });

  if (kpi) {
    children.push({
      text: 'KPI 요약',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
    });
    children.push({
      text: `총 학습 시간: ${kpi.totalStudyHours}시간 | 과제 완료율: ${kpi.assignmentCompletionRate}%`,
      spacing: { after: 300 },
    });
  }

  if (mentee.scores?.naesin || mentee.scores?.mockExam) {
    children.push({
      text: '과목별 성적 (내신/모의고사)',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
    });
    const labels: Record<string, string> = { korean: '국어', english: '영어', math: '수학' };
    const subjKeys = ['korean', 'english', 'math'] as const;
    if (mentee.scores.naesin) {
      subjKeys.forEach((k) => {
        const subj = mentee.scores!.naesin![k];
        if (subj && typeof subj === 'object') {
          const vals = [subj.midterm1, subj.final1, subj.midterm2, subj.final2]
            .map((v) => (v != null ? String(v) : '-'))
            .join(', ');
          children.push({ text: `${labels[k]} 내신: ${vals}`, spacing: { after: 100 } });
        }
      });
    }
    if (mentee.scores.mockExam) {
      subjKeys.forEach((k) => {
        const subj = mentee.scores!.mockExam![k];
        if (subj && typeof subj === 'object') {
          const vals = [subj.march, subj.june, subj.september, subj.november]
            .map((v) => (v != null ? String(v) : '-'))
            .join(', ');
          children.push({ text: `${labels[k]} 모의고사: ${vals}`, spacing: { after: 100 } });
        }
      });
      children.push({ text: '', spacing: { after: 200 } });
    }
  }

  if (weeklyPatterns.length > 0) {
    children.push({
      text: '생활패턴 분석',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
    });
    children.push({
      text: weeklyPatterns.map((p) => `${p.day}: ${p.hours || 0}시간`).join(' | '),
      spacing: { after: 300 },
    });
  }

  if (subjectStudyTimes.length > 0) {
    children.push({
      text: '과목별 학습 시간',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
    });
    subjectStudyTimes
      .sort((a, b) => b.hours - a.hours)
      .forEach((item) => {
        children.push({
          text: `${item.subject}: ${item.hours}시간`,
          spacing: { after: 100 },
        });
      });
  }

  if (analysis.overallAnalysis?.summary.length) {
    children.push({
      text: '전반적인 학습 태도 및 공부 스타일',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
    });
    analysis.overallAnalysis.summary.forEach((t: string) =>
      children.push({ text: t, spacing: { after: 150 } }),
    );
  }

  if (
    analysis.subjectDetailedAnalysis &&
    Object.keys(analysis.subjectDetailedAnalysis).length > 0
  ) {
    Object.entries(analysis.subjectDetailedAnalysis).forEach(([subject, details]) => {
      const d = details as {
        studyStyle: string[];
        weakAreas: string[];
        mistakeTypes: string[];
        guidanceDirection: string[];
      };
      children.push({
        text: `${subject} 과목 분석`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      });
      if (d.studyStyle.length) {
        children.push({
          text: '학습 스타일',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 100, after: 100 },
        });
        d.studyStyle.forEach((s: string) => children.push({ text: s, spacing: { after: 100 } }));
      }
      if (d.weakAreas.length) {
        children.push({
          text: '취약한 부분',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 100, after: 100 },
        });
        d.weakAreas.forEach((a: string) =>
          children.push({ text: `• ${a}`, spacing: { after: 100 } }),
        );
      }
      if (d.mistakeTypes.length) {
        children.push({
          text: '실수 유형',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 100, after: 100 },
        });
        d.mistakeTypes.forEach((m: string) => children.push({ text: m, spacing: { after: 100 } }));
      }
      if (d.guidanceDirection.length) {
        children.push({
          text: '지도 방향',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 100, after: 100 },
        });
        d.guidanceDirection.forEach((g: string) =>
          children.push({ text: g, spacing: { after: 100 } }),
        );
      }
    });
  }

  if (analysis.overallGuidance?.length) {
    children.push({
      text: '종합 평가 및 상담 마무리 멘트',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
    });
    analysis.overallGuidance.forEach((g: string) =>
      children.push({ text: g, spacing: { after: 150 } }),
    );
  }

  const paragraphs = children.map((opts) => new Paragraph(opts));
  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `학생분석리포트_${mentee.name}_${new Date().toISOString().slice(0, 10)}.docx`);
}

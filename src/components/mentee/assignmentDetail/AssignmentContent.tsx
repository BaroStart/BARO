import type { AssignmentDetail } from '@/types';

export default function AssignmentContent({ detail }: { detail: AssignmentDetail | null }) {
  const checklist = detail?.contentChecklist ?? null;

  return (
    <>
      <section>
        <div className="p-5 border bg-slate-50 rounded-xl border-slate-100">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">과제 내용</h3>
          <ul className="space-y-4">
            {(checklist?.length
              ? checklist
              : [
                  '오늘은 과제를 진행해 주세요.',
                  '틀린 문제는 왜 틀렸는지 반드시 분석해 주세요.',
                  '모르는 개념/어휘는 따로 정리하면 좋아요.',
                ]
            ).map((text, idx) => (
              <li key={idx} className="flex gap-3 text-sm leading-relaxed text-slate-600">
                <span className="select-none text-slate-300">•</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

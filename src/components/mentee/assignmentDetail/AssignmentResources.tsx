import { BookOpen, Download, FileText } from 'lucide-react';
import type { AssignmentDetail } from '@/types';

export default function AssignmentResources({ detail }: { detail: AssignmentDetail | null }) {
  const files = detail?.providedPdfs ?? [];

  return (
    <>
      <section>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-slate-900" />
          <h3 className="text-sm font-semibold text-slate-900">학습 자료</h3>
        </div>
        {files.length > 0 ? (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(var(--brand))]/10 transition-colors">
                    <FileText className="w-5 h-5 text-slate-500 group-hover:text-[hsl(var(--brand))] transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-0.5">{file.name}</p>
                    <p className="text-xs text-slate-400">{file.size} · 멘토 업로드</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-[hsl(var(--brand))] transition-colors" type="button">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 border bg-slate-50 rounded-xl border-slate-100 text-sm text-slate-500">
            업로드된 학습 자료가 없습니다.
          </div>
        )}
      </section>
    </>
  );
}

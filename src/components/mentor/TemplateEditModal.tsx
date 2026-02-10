import { useState } from 'react';

import type { FeedbackTemplateRes } from '@/generated';
import { getSubjectLabel } from '@/lib/subjectLabels';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogFooter, DialogHeader } from '@/components/ui/Dialog';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

export function TemplateEditModal({
  template,
  onClose,
  onSave,
}: {
  template: FeedbackTemplateRes | null;
  onClose: () => void;
  onSave: (data: { name: string; subject: string; content: string }) => void;
}) {
  const [name, setName] = useState(template?.name ?? '');
  const [subject, setSubject] = useState(
    template?.subject ? getSubjectLabel(template.subject) : '국어',
  );
  const [content, setContent] = useState(template?.content ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    onSave({ name: name.trim(), subject, content: content.trim() });
  };

  return (
    <Dialog open onClose={onClose} maxWidth="max-w-2xl">
      <DialogHeader onClose={onClose}>
        <h2 className="text-lg font-semibold text-foreground">
          {template ? '템플릿 수정' : '템플릿 추가'}
        </h2>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
        <div className="space-y-5 px-6 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/80">
              템플릿명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="템플릿 이름을 입력해주세요"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/80">
              과목 선택 <span className="text-red-500">*</span>
            </label>
            <FilterTabs
              items={(['국어', '영어', '수학', '공통'] as const).map((sub) => ({
                id: sub,
                label: sub,
              }))}
              value={subject}
              onChange={setSubject}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground/80">
              템플릿 본문 <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="피드백 템플릿 내용을 작성하세요..."
              className="min-h-[300px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={!name.trim() || !content.trim()}>
            저장하기
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

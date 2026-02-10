import { BookOpen, Calculator, Calendar, FileText, Hash, Hexagon } from 'lucide-react';

import type { FeedbackTemplateRes } from '@/generated';
import { formatDateTime } from '@/lib/dateUtils';
import { getSubjectLabel } from '@/lib/subjectLabels';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/ui/Dialog';

const SUBJECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  국어: BookOpen,
  영어: FileText,
  수학: Calculator,
  공통: Hexagon,
};

export function TemplateViewModal({
  template,
  onClose,
}: {
  template: FeedbackTemplateRes;
  onClose: () => void;
}) {
  const subjectLabel = getSubjectLabel(template.subject);
  const SubjectIcon = SUBJECT_ICONS[subjectLabel] ?? Hexagon;

  const meta = [
    subjectLabel
      ? {
          icon: SubjectIcon,
          label: subjectLabel,
        }
      : null,
    template.createdAt
      ? {
          icon: Calendar,
          label: formatDateTime(template.createdAt),
        }
      : null,
    template.usageCount != null
      ? {
          icon: Hash,
          label: `${template.usageCount}회 사용`,
        }
      : null,
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string }[];

  return (
    <Dialog open onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <h2 className="text-lg font-semibold text-foreground">{template.name}</h2>
      </DialogHeader>
      <DialogBody className="space-y-4">
        {meta.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {meta.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-sm font-medium text-foreground/60"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </span>
            ))}
          </div>
        )}

        {template.content && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/40">
              본문
            </p>
            <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                {template.content}
              </p>
            </div>
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          닫기
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

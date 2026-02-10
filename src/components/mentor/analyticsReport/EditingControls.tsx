import { Edit, Save, X } from 'lucide-react';

export function EditButtons({
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const btnClass =
    'flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100';
  if (!isEditing) {
    return (
      <button type="button" onClick={onEdit} className={btnClass}>
        <Edit className="h-3 w-3" /> 편집
      </button>
    );
  }
  return (
    <div className="flex gap-1">
      <button type="button" onClick={onSave} className={btnClass}>
        <Save className="h-3 w-3" /> 저장
      </button>
      <button type="button" onClick={onCancel} className={btnClass}>
        <X className="h-3 w-3" /> 취소
      </button>
    </div>
  );
}

export function TextareaField({
  label,
  value,
  rows,
  onChange,
}: {
  label: string;
  value: string;
  rows: number;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

export function TagList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="mb-2 text-xs font-semibold text-slate-700">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s, idx) => (
          <span
            key={idx}
            className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

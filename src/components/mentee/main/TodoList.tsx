import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TodoCard, type TodoItem } from "./TodoCard";
import { PlusIcon } from "@/components/icons";
import type { TimeRangeValue } from "../TimeRangeModal";

const schema = z.object({
  title: z.string().trim().min(1, "할 일을 입력해주세요.").max(40, "40자 이내로 입력해주세요."),
});
type FormValues = z.infer<typeof schema>;

type Props = {
  items: TodoItem[];
  onAddAtTop: (title: string) => void | Promise<void>;
  onToggleDone: (id: number, args?: { timeRange?: TimeRangeValue }) => void | Promise<void>;
  onUpdateTitle: (id: number, title: string) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
};

export function TodoList({ items, onAddAtTop, onToggleDone, onUpdateTitle, onDelete }: Props) {
  const [isAdding, setIsAdding] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "" },
    mode: "onSubmit",
  });

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      if (a.done === b.done) return 0;
      return a.done ? 1 : -1;
    });
    return copy;
  }, [items]);

  const pendingCount = sorted.filter((x) => !x.done).length;

  const submitAdd = form.handleSubmit(({ title }) => {
    onAddAtTop(title.trim());
    form.reset({ title: "" });
    setIsAdding(false);
  });

  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-slate-700">할 일</h3>
          <span className="text-[11px] text-slate-400">
            미완료 {pendingCount} / 전체 {sorted.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsAdding((v) => !v);
            form.reset({ title: "" });
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-white active:scale-[0.98]"
          aria-label="할 일 추가"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {isAdding && (
          <form onSubmit={submitAdd}>
            <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5">
              <div className="flex items-center gap-2">
                <input
                  {...form.register("title")}
                  placeholder="할 일 입력"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] font-medium outline-none placeholder:text-slate-400 focus:border-slate-400"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-white active:scale-[0.99]"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    form.reset({ title: "" });
                  }}
                  className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500 active:scale-[0.99]"
                >
                  취소
                </button>
              </div>
              {form.formState.errors.title?.message && (
                <p className="mt-1 pl-0.5 text-[11px] text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
          </form>
        )}

        {sorted.length === 0 && !isAdding ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-[13px] text-slate-400">
            할 일이 없습니다.
          </div>
        ) : (
          sorted.map((it) => (
            <TodoCard
              key={it.id}
              item={it}
              onToggleDone={(args) => onToggleDone(it.id, args)}
              onUpdateTitle={(title) => onUpdateTitle(it.id, title)}
              onDelete={() => onDelete(it.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

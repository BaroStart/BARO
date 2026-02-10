import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { TimeRangeModal, type TimeRangeValue } from "../TimeRangeModal";

export type TodoItem = {
  id: number;
  title: string;
  done: boolean;
};

type Props = {
  item: TodoItem;
  onToggleDone: (args?: { timeRange?: TimeRangeValue }) => void | Promise<void>;
  onUpdateTitle: (title: string) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
};

const schema = z.object({
  title: z.string().trim().min(1, "할 일을 입력해주세요.").max(40, "40자 이내로 입력해주세요."),
});
type FormValues = z.infer<typeof schema>;

export function TodoCard({
  item,
  onToggleDone,
  onUpdateTitle,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [timeModalOpen, setTimeModalOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: item.title },
    mode: "onSubmit",
  });

  const errorMsg = form.formState.errors.title?.message;

  useEffect(() => {
    form.reset({ title: item.title });
  }, [item.title, form]);

  useEffect(() => {
    if (isEditing) setTimeout(() => inputRef.current?.focus(), 0);
  }, [isEditing]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("[data-todo-menu]")) return;
      setMenuOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const submitEdit = form.handleSubmit(({ title }) => {
    onUpdateTitle(title.trim());
    setIsEditing(false);
  });

  const startEdit = () => {
    setMenuOpen(false);
    setIsEditing(true);
    form.reset({ title: item.title });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    form.reset({ title: item.title });
  };

  const handleClickCheck = () => {
    if (item.done) {
      setMenuOpen(false);
      if (isEditing) cancelEdit();
      onToggleDone();
      return;
    }
    setTimeModalOpen(true);
  };

  const isDone = item.done;

  return (
    <>
      <div className="relative w-full rounded-xl border border-slate-100 bg-white text-left">
        <div className={["flex gap-3 px-3.5 py-3", isEditing ? "items-start" : "items-center"].join(" ")}>
          <button
            type="button"
            onClick={handleClickCheck}
            className="flex h-4 w-4 shrink-0 items-center justify-center"
            aria-label={isDone ? "완료 해제" : "완료 체크"}
          >
            <div
              className={[
                "flex h-4 w-4 items-center justify-center rounded border-[1.5px] transition",
                isDone ? "border-slate-400 bg-slate-400" : "border-slate-300 bg-white",
              ].join(" ")}
            >
              {isDone && <span className="text-[9px] font-bold text-white">✓</span>}
            </div>
          </button>

          <div className="min-w-0 flex-1">
            {!isEditing ? (
              <div
                className={[
                  "truncate text-[13px]",
                  isDone ? "font-medium text-slate-400 line-through" : "font-semibold text-slate-700",
                ].join(" ")}
              >
                {item.title}
              </div>
            ) : (
              <form onSubmit={submitEdit}>
                <input
                  {...form.register("title")}
                  ref={(e) => {
                    form.register("title").ref(e);
                    inputRef.current = e;
                  }}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] font-medium outline-none focus:border-slate-400"
                />
                {errorMsg && <p className="mt-1 text-[11px] text-red-500">{errorMsg}</p>}

                <div className="mt-2 flex justify-end gap-1.5">
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] font-medium text-white active:scale-[0.99]"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-500 active:scale-[0.99]"
                  >
                    취소
                  </button>
                </div>
              </form>
            )}
          </div>

          {!isEditing && (
            <div className="shrink-0 flex items-center" data-todo-menu>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-slate-50 active:scale-[0.98]"
                aria-label="메뉴"
              >
                <span className="text-sm leading-none text-slate-400">⋮</span>
              </button>

              {menuOpen && (
                <div className="absolute right-3.5 bottom-full mb-1 z-50 w-24 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="block w-full px-3 py-2 text-left text-[13px] text-slate-600 hover:bg-slate-50"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="block w-full px-3 py-2 text-left text-[13px] text-red-500 hover:bg-slate-50"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <TimeRangeModal
        open={timeModalOpen}
        onClose={() => setTimeModalOpen(false)}
        onSubmit={(value: TimeRangeValue) => {
          setTimeModalOpen(false);
          onToggleDone({ timeRange: value });
        }}
      />
    </>
  );
}

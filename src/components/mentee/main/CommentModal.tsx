import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";

import { UserIcon } from "@/components/icons";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Sheet";

const commentSchema = z.object({
  content: z.string().trim().min(1, "내용을 입력해주세요.").max(500, "500자 이내로 입력해주세요."),
});

export type CommentModalValues = z.infer<typeof commentSchema>;

type ThreadMessage = {
  id: string;
  author: string;
  content: string;
  parentId?: string | null;
  createdAtText?: string;
};

type CommentModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CommentModalValues) => void | Promise<void>;
  thread?: {
    root?: ThreadMessage | null;
    replies?: ThreadMessage[];
  };
  defaultValues?: Partial<CommentModalValues>;
  title?: string;
  onSendReply?: (text: string) => void | Promise<void>;
};

export function CommentModal({
  open,
  onClose,
  onSubmit,
  thread,
  defaultValues,
  title = "오늘의 한마디 & 질문",
  onSendReply,
}: CommentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<CommentModalValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: defaultValues?.content ?? "" },
  });

  const [replyText, setReplyText] = useState("");
  const [localReplies, setLocalReplies] = useState<ThreadMessage[]>([]);

  const root = thread?.root ?? null;
  const hasSubmitted = !!root;

  const replies = useMemo(() => {
    return [...(thread?.replies ?? []), ...localReplies];
  }, [thread?.replies, localReplies]);

  useEffect(() => {
    if (open) {
      reset({ content: defaultValues?.content ?? "" });
      setReplyText("");
      setLocalReplies([]);
    }
  }, [open, defaultValues?.content, reset]);

  const content = watch("content") ?? "";
  const canSubmit = content.trim().length > 0 && !isSubmitting;
  const canSendReply = replyText.trim().length > 0 && !isSubmitting && hasSubmitted;

  const handleSendReply = async () => {
    if (!root) return;
    const text = replyText.trim();
    if (!text) return;

    if (onSendReply) {
      await onSendReply(text);
    } else {
      setLocalReplies((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          author: "나",
          content: text,
          parentId: root.id,
          createdAtText: "방금",
        },
      ]);
    }
    setReplyText("");
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        {/* 스레드 영역 */}
        <SheetBody className="max-h-[40vh] overflow-y-auto">
          {!root ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <p className="text-[13px] text-slate-400">
                아직 남긴 내용이 없어요. 오늘의 한마디나 궁금한 점을 편하게 남겨보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium text-slate-700">{root.author}</span>
                    {root.createdAtText && (
                      <span className="text-[11px] text-slate-400">{root.createdAtText}</span>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600">
                    {root.content}
                  </p>
                </div>
              </div>

              {replies.length > 0 && (
                <div className="ml-11 space-y-3">
                  {replies.map((r) => (
                    <div key={r.id} className="flex gap-2.5">
                      <div
                        className={[
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                          r.author === "멘토" ? "bg-sky-50" : "bg-slate-100",
                        ].join(" ")}
                      >
                        <UserIcon
                          className={[
                            "h-3 w-3",
                            r.author === "멘토" ? "text-sky-400" : "text-slate-400",
                          ].join(" ")}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-slate-600">{r.author}</span>
                          {r.createdAtText && (
                            <span className="text-[10px] text-slate-400">{r.createdAtText}</span>
                          )}
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-500">
                          {r.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </SheetBody>

        {/* 입력 영역 */}
        {!hasSubmitted ? (
          <form
            onSubmit={handleSubmit(async (values) => {
              await onSubmit(values);
            })}
            className="border-t border-slate-100 px-5 py-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <textarea
              {...register("content")}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-200 focus:bg-white"
              placeholder="오늘 어려웠던 점, 궁금한 점을 편하게 적어주세요."
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={!canSubmit}
                className={[
                  "h-9 rounded-lg px-4 text-[13px] font-medium transition",
                  canSubmit
                    ? "bg-slate-800 text-white active:scale-[0.99]"
                    : "bg-slate-100 text-slate-400",
                ].join(" ")}
              >
                {isSubmitting ? "저장 중..." : "등록"}
              </button>
            </div>
          </form>
        ) : (
          <div
            className="border-t border-slate-100 px-5 py-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-end gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={1}
                placeholder="답글을 입력하세요"
                className="min-h-[36px] flex-1 resize-none rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-200 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleSendReply}
                disabled={!canSendReply}
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition",
                  canSendReply
                    ? "bg-slate-800 text-white active:scale-[0.98]"
                    : "bg-slate-100 text-slate-300",
                ].join(" ")}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

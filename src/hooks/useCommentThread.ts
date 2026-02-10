import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createComment } from '@/api/comments';
import { createSubComment, fetchSubComments } from '@/api/subComments';
import type { User } from '@/types/auth';
import type { GetSubCommentResponseDto } from '@/generated';

type ThreadMessage = {
  id: string;
  author: string;
  content: string;
  parentId?: string | null;
  createdAtText?: string;
};

interface StoredComment {
  commentId: number;
  content: string;
  author: string;
  createdAt: string;
}

function storageKey(userId: string) {
  return `comment-thread-${userId}`;
}

function loadStored(userId: string): StoredComment | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as StoredComment) : null;
  } catch {
    return null;
  }
}

function saveStored(userId: string, data: StoredComment) {
  localStorage.setItem(storageKey(userId), JSON.stringify(data));
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return '방금';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}

function mapSubComment(sc: GetSubCommentResponseDto, commentId: number): ThreadMessage {
  return {
    id: String(sc.subCommentId),
    author: sc.userType === 'MENTOR' ? (sc.name ?? '멘토') : (sc.name ?? '나'),
    content: sc.subContent ?? '',
    parentId: String(commentId),
    createdAtText: sc.createdAt ? relativeTime(sc.createdAt) : '',
  };
}

export function useCommentThread(user: User | null) {
  const queryClient = useQueryClient();

  // commentId: localStorage에서 복원 (서버에 "내 코멘트 조회" API가 없으므로)
  const [stored, setStored] = useState<StoredComment | null>(() =>
    user ? loadStored(user.id) : null,
  );

  const commentId = stored?.commentId ?? null;

  // root 메시지 (localStorage에서 복원)
  const root: ThreadMessage | null = stored
    ? {
        id: String(stored.commentId),
        author: stored.author,
        content: stored.content,
        createdAtText: relativeTime(stored.createdAt),
      }
    : null;

  // 대댓글: React Query 캐싱
  const { data: replies = [] } = useQuery({
    queryKey: ['subComments', commentId],
    queryFn: async () => {
      const list = await fetchSubComments(commentId!);
      return [...list]
        .sort((a, b) => new Date(a.createdAt ?? '').getTime() - new Date(b.createdAt ?? '').getTime())
        .map((sc) => mapSubComment(sc, commentId!));
    },
    enabled: commentId != null,
  });

  // 코멘트 생성
  const submitMutation = useMutation({
    mutationFn: (values: { content: string }) => createComment({ content: values.content }),
    onSuccess: (res, variables) => {
      if (!user) return;
      const newId = (res as { commentId?: number }).commentId;
      if (newId == null) return;

      const data: StoredComment = {
        commentId: newId,
        content: variables.content,
        author: '나',
        createdAt: new Date().toISOString(),
      };
      saveStored(user.id, data);
      setStored(data);
    },
  });

  // 대댓글 작성
  const replyMutation = useMutation({
    mutationFn: (text: string) => createSubComment({ commentId: commentId!, subContent: text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subComments', commentId] });
    },
  });

  const handleSubmit = useCallback(
    async (values: { content: string }) => {
      await submitMutation.mutateAsync(values);
    },
    [submitMutation],
  );

  const handleSendReply = useCallback(
    async (text: string) => {
      await replyMutation.mutateAsync(text);
    },
    [replyMutation],
  );

  return {
    thread: { root, replies },
    handleSubmit,
    handleSendReply,
    loading: submitMutation.isPending || replyMutation.isPending,
  };
}

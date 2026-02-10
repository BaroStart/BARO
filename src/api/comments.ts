import type { CreateCommentRequestDto, UpdateCommentRequestDto } from '@/generated';

import { commentsApi } from './clients';

// 코멘트 조회
export async function fetchComments(mentorId: number) {
  const { data } = await commentsApi.getComment({ mentorId });
  return data.result ?? [];
}

// 코멘트 생성
export async function createComment(body: CreateCommentRequestDto) {
  const { data } = await commentsApi.createComment({ createCommentRequestDto: body });
  return data.result ?? {};
}

// 코멘트 수정
export async function updateComment(commentId: number, body: UpdateCommentRequestDto) {
  const { data } = await commentsApi.updateComment({ commentId, updateCommentRequestDto: body });
  return data;
}

// 코멘트 삭제
export async function deleteComment(commentId: number) {
  const { data } = await commentsApi.deleteComment({ commentId });
  return data;
}

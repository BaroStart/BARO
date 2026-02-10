import type { CreateSubCommentRequestDto, UpdateSubCommentRequestDto } from '@/generated';

import { commentsApi } from './clients';

// 댓글 조회
export async function fetchSubComments(commentId: number) {
  const { data } = await commentsApi.getSubComments({ commentId });
  return data.result ?? [];
}

// 댓글 작성
export async function createSubComment(body: CreateSubCommentRequestDto) {
  const { data } = await commentsApi.createSubComment({ createSubCommentRequestDto: body });
  return data.result ?? {};
}

// 댓글 수정
export async function updateSubComment(subCommentId: number, body: UpdateSubCommentRequestDto) {
  const { data } = await commentsApi.updateSubComment({ subCommentId, updateSubCommentRequestDto: body });
  return data;
}

// 댓글 삭제
export async function deleteSubComment(subCommentId: number) {
  const { data } = await commentsApi.deleteSubComment({ subCommentId });
  return data;
}

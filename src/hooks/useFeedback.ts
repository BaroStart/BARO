import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createFeedback } from '@/api/feedback';

/** 피드백 제출 */
export function useSubmitFeedback(assignmentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, summary }: { content: string; summary?: string }) =>
      createFeedback(assignmentId, content, summary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submittedAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['mentees'] });
    },
  });
}

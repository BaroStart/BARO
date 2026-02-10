import { useQuery } from '@tanstack/react-query';

import { fetchAssignmentDetail } from '@/api/assignmentDetail';
import type { AssignmentDetail } from '@/types';

export function useAssignmentDetail(
  menteeId: string | undefined,
  assignmentId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['assignmentDetail', menteeId, assignmentId],
    queryFn: (): Promise<AssignmentDetail | null> => {
      if (!menteeId || !assignmentId) return Promise.resolve(null);
      return fetchAssignmentDetail(menteeId, assignmentId);
    },
    enabled: (options?.enabled ?? true) && !!menteeId && !!assignmentId,
  });
}

import { useQuery } from '@tanstack/react-query';

import { fetchSubmittedAssignments } from '@/api/menteeDetail';

export function useSubmittedAssignments(menteeId?: string) {
  return useQuery({
    queryKey: ['submittedAssignments', menteeId],
    queryFn: () => fetchSubmittedAssignments(menteeId),
  });
}

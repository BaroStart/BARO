import { useQuery } from '@tanstack/react-query';

import { fetchMentee } from '@/api/mentees';

export function useMentee(menteeId: string | undefined) {
  return useQuery({
    queryKey: ['mentee', menteeId],
    queryFn: () => fetchMentee(menteeId!),
    enabled: !!menteeId,
  });
}

import { useQuery } from '@tanstack/react-query';

import { fetchMentees } from '@/api/mentees';

const MENTEES_QUERY_KEY = ['mentees'] as const;

export function useMentees() {
  return useQuery({
    queryKey: MENTEES_QUERY_KEY,
    queryFn: fetchMentees,
  });
}

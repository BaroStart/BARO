import { useQuery } from '@tanstack/react-query';

import { fetchMenteeCalendar } from '@/api/menteeV1';

export function useMenteeCalendar(year: number, month: number) {
  return useQuery({
    queryKey: ['menteeCalendar', year, month],
    queryFn: () => fetchMenteeCalendar(year, month),
    enabled: !!year && !!month,
  });
}

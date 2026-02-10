import { useQuery } from '@tanstack/react-query';

import { fetchMenteeTimetable } from '@/api/menteeV1';

export function useMenteeTimetable(date?: string) {
  return useQuery({
    queryKey: ['menteeTimetable', date],
    queryFn: () => fetchMenteeTimetable(date),
    enabled: !!date,
  });
}

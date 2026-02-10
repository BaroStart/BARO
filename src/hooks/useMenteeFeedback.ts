import { useQuery } from '@tanstack/react-query';

import { fetchDailyFeedbacks, fetchDailyFeedbackSummaries } from '@/api/feedback';
import type { GetDailyFeedbacksSubjectEnum } from '@/generated';

export function useDailyFeedbacks(
  subject?: GetDailyFeedbacksSubjectEnum | 'ALL' | 'COMMON',
  options?: { enabled?: boolean },
) {
  const apiSubject: GetDailyFeedbacksSubjectEnum | undefined =
    subject == null || subject === 'ALL' ? undefined : (subject as GetDailyFeedbacksSubjectEnum);
  return useQuery({
    queryKey: ['dailyFeedbacks', apiSubject],
    queryFn: () => fetchDailyFeedbacks(apiSubject),
    enabled: options?.enabled ?? true,
  });
}

export function useDailyFeedbackSummaries(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['dailyFeedbackSummaries'],
    queryFn: () => fetchDailyFeedbackSummaries(),
    enabled: options?.enabled ?? true,
  });
}

import { useQuery } from '@tanstack/react-query';

import {
  fetchSubjectStudyTimes,
  fetchWeeklyPatterns,
} from '@/api/learningAnalysis';
import type { DailyStudyPattern, SubjectStudyTime } from '@/types';

export function useSubjectStudyTimes(menteeId: string | undefined) {
  return useQuery({
    queryKey: ['subjectStudyTimes', menteeId],
    queryFn: (): Promise<SubjectStudyTime[]> => {
      if (!menteeId) return Promise.resolve([]);
      return fetchSubjectStudyTimes(menteeId);
    },
    enabled: !!menteeId,
  });
}

export function useWeeklyPatterns(menteeId: string | undefined) {
  return useQuery({
    queryKey: ['weeklyPatterns', menteeId],
    queryFn: (): Promise<DailyStudyPattern[]> => {
      if (!menteeId) return Promise.resolve([]);
      return fetchWeeklyPatterns(menteeId);
    },
    enabled: !!menteeId,
  });
}

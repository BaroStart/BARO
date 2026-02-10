import { useQuery } from '@tanstack/react-query';

import {
  fetchFeedbackItems,
  fetchIncompleteAssignments,
  fetchMenteeKpi,
  fetchMenteeTasks,
  fetchTodayComments,
} from '@/api/menteeDetail';

type DateRange = { startDate?: string; endDate?: string };

export function useFeedbackItems(
  menteeId: string | undefined,
  params?: { subject?: string } & DateRange,
) {
  return useQuery({
    queryKey: ['feedbackItems', menteeId, params],
    queryFn: () => fetchFeedbackItems(menteeId!, params),
    enabled: !!menteeId,
  });
}

export function useIncompleteAssignments(menteeId: string | undefined, params?: DateRange) {
  return useQuery({
    queryKey: ['incompleteAssignments', menteeId, params],
    queryFn: () => fetchIncompleteAssignments(menteeId!, params),
    enabled: !!menteeId,
  });
}

export function useMenteeTasks(
  menteeId: string | undefined,
  params?: { date?: string } & DateRange,
) {
  return useQuery({
    queryKey: ['menteeTasks', menteeId, params],
    queryFn: () => fetchMenteeTasks(menteeId!, params),
    enabled: !!menteeId,
  });
}

export function useTodayComment(menteeId: string | undefined, date?: string) {
  return useQuery({
    queryKey: ['todayComment', menteeId, date],
    queryFn: () => fetchTodayComments(menteeId!, date),
    enabled: !!menteeId && !!date,
  });
}

export function useMenteeKpi(menteeId: string | undefined) {
  return useQuery({
    queryKey: ['menteeKpi', menteeId],
    queryFn: () => fetchMenteeKpi(menteeId!),
    enabled: !!menteeId,
  });
}

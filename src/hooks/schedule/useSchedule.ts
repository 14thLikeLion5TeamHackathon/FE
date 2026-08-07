import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createSchedule, deleteSchedule, getSchedule, updateSchedule } from '../../api/schedule';
import type { ScheduleForm } from '../../types/schedule';

const scheduleKeys = {
  detail: (scheduleId: string) => ['schedule', scheduleId] as const,
};

/** 수정 화면에서만 쓴다. 추가 화면은 scheduleId가 없다. */
export function useSchedule(scheduleId?: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(scheduleId ?? ''),
    queryFn: () => getSchedule(scheduleId as string),
    enabled: Boolean(scheduleId),
  });
}

/** 일정이 바뀌면 오늘 탭 브리핑도 다시 계산돼야 한다. */
function useInvalidateToday() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ['today'] });
}

export function useCreateSchedule() {
  const invalidateToday = useInvalidateToday();
  return useMutation({ mutationFn: createSchedule, onSuccess: invalidateToday });
}

export function useUpdateSchedule(scheduleId: string) {
  const invalidateToday = useInvalidateToday();
  return useMutation({
    mutationFn: (body: ScheduleForm) => updateSchedule(scheduleId, body),
    onSuccess: invalidateToday,
  });
}

export function useDeleteSchedule() {
  const invalidateToday = useInvalidateToday();
  return useMutation({ mutationFn: deleteSchedule, onSuccess: invalidateToday });
}

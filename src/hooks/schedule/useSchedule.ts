import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createSchedule, deleteSchedule, getSchedule, updateSchedule } from '../../api/schedule';
import { rememberScheduleDate } from '../../lib/scheduleDates';
import type { ScheduleRequest } from '../../types/schedule';

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

/**
 * 넣거나 고친 날짜를 기억해 캘린더에 점을 찍는다.
 *
 * 서버에 날짜 범위로 직접 입력 일정을 묻는 방법이 없어서다(lib/scheduleDates.ts 주석).
 * 응답이 아니라 **보낸 값**의 날짜를 쓴다 — 응답 스키마에 required가 하나도 없어
 * eventDate가 비어 올 수 있는데, 우리가 보낸 값은 확실하다.
 */
export function useCreateSchedule() {
  const invalidateToday = useInvalidateToday();
  return useMutation({
    mutationFn: createSchedule,
    onSuccess: (_data, body) => {
      rememberScheduleDate(body.eventDate);
      invalidateToday();
    },
  });
}

export function useUpdateSchedule(scheduleId: string) {
  const invalidateToday = useInvalidateToday();
  return useMutation({
    mutationFn: (body: ScheduleRequest) => updateSchedule(scheduleId, body),
    onSuccess: (_data, body) => {
      // 날짜를 옮긴 수정이면 새 날짜가 기억된다. 옛 날짜의 점은 그 날을 열었을 때
      // 브리핑이 사실을 알려주며 사라진다(syncScheduleDate).
      rememberScheduleDate(body.eventDate);
      invalidateToday();
    },
  });
}

export function useDeleteSchedule() {
  const invalidateToday = useInvalidateToday();
  return useMutation({ mutationFn: deleteSchedule, onSuccess: invalidateToday });
}

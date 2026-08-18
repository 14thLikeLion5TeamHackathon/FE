import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { disconnectCalendar, getCalendarStatus } from '../../api/calendar';

const calendarKeys = {
  status: ['calendar', 'status'] as const,
};

/** 구글 캘린더 연동 여부 */
export function useCalendarStatus() {
  return useQuery({
    queryKey: calendarKeys.status,
    queryFn: getCalendarStatus,
  });
}

/**
 * 연동 해제.
 *
 * 오늘 탭도 같이 버린다 — 일정 조회 여부를 브리핑의 `calendarConnected`로 판단하기 때문에,
 * 해제하고 오늘 탭에 돌아가면 없는 연동으로 일정을 계속 부른다(미연동이면 500이 온다).
 */
export function useDisconnectCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectCalendar,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: calendarKeys.status });
      void queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}

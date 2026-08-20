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
 * 상태와 오늘 탭을 같이 버린다. 오늘 탭의 일정 조회가 이 상태 쿼리를 보고 켜지므로
 * (`useCalendarEvents`), 상태만 갱신하고 일정을 남겨두면 해제한 뒤에도 이전 일정이
 * 목록에 그대로 남는다.
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

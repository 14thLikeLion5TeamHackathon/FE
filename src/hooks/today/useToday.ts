import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getToday, toggleChecklistItem } from '../../api/today';
import type { Coords } from '../../lib/location';

const todayKeys = {
  all: ['today'] as const,
  byDate: (date?: string, coords?: Coords | null) =>
    ['today', date ?? 'today', coords ? `${coords.lat},${coords.lng}` : 'no-coords'] as const,
};

/**
 * 오늘 탭 전체. date를 넘기면 그 날짜 기준으로 갱신된다.
 * 좌표가 정해지기 전(GPS 응답 대기)에는 조회를 보류한다 — 위치 없는 결과를 한 번 보여주고
 * 곧바로 다른 값으로 덮으면 화면이 두 번 바뀌기 때문.
 */
export function useToday(date?: string, coords?: Coords | null) {
  return useQuery({
    queryKey: todayKeys.byDate(date, coords),
    queryFn: () => getToday(date, coords ?? undefined),
    enabled: coords != null,
  });
}

export function useToggleChecklistItem(date?: string, coords?: Coords | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, done }: { itemId: string; done: boolean }) =>
      toggleChecklistItem(itemId, done),
    /** 체크는 즉시 반응해야 하므로 서버 응답을 기다리지 않는다. */
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: todayKeys.byDate(date, coords) });
    },
  });
}

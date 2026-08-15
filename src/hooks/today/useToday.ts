import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getToday, toggleChecklistItem } from '../../api/today';
import type { TodayLocation } from '../../lib/location';

const todayKeys = {
  all: ['today'] as const,
  byDate: (date?: string, location?: TodayLocation) =>
    [
      'today',
      date ?? 'today',
      location ? `${location.city}_${location.district}` : 'no-location',
    ] as const,
};

/**
 * 오늘 탭 전체. date를 넘기면 그 날짜 기준으로 갱신된다.
 * 기준 위치는 저장값 또는 기본값이라 항상 정해져 있다 — 조회를 보류할 일이 없다.
 */
export function useToday(date?: string, location?: TodayLocation) {
  return useQuery({
    queryKey: todayKeys.byDate(date, location),
    queryFn: () => getToday(date, location),
  });
}

export function useToggleChecklistItem(date?: string, location?: TodayLocation) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, done }: { itemId: string; done: boolean }) =>
      toggleChecklistItem(itemId, done),
    /** 체크는 즉시 반응해야 하므로 서버 응답을 기다리지 않는다. */
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: todayKeys.byDate(date, location) });
    },
  });
}

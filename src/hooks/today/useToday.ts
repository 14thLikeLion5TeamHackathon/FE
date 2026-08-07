import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getToday, toggleChecklistItem } from '../../api/today';

const todayKeys = {
  all: ['today'] as const,
  byDate: (date?: string) => ['today', date ?? 'today'] as const,
};

/** 오늘 탭 전체. date를 넘기면 그 날짜 기준으로 갱신된다. */
export function useToday(date?: string) {
  return useQuery({
    queryKey: todayKeys.byDate(date),
    queryFn: () => getToday(date),
  });
}

export function useToggleChecklistItem(date?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, done }: { itemId: string; done: boolean }) =>
      toggleChecklistItem(itemId, done),
    /** 체크는 즉시 반응해야 하므로 서버 응답을 기다리지 않는다. */
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: todayKeys.byDate(date) });
    },
  });
}

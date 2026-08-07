import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createRecord, getRecords } from '../../api/record';

const recordKeys = {
  byCard: (cardId: string) => ['record', 'card', cardId] as const,
};

/** 카드 상세의 회복 기록 타임라인 */
export function useRecords(cardId: string) {
  return useQuery({
    queryKey: recordKeys.byCard(cardId),
    queryFn: () => getRecords(cardId),
    enabled: Boolean(cardId),
  });
}

/**
 * 기록 저장. 성공하면 recordId가 오므로
 * `/records/:recordId/feedback`으로 이동하면 된다.
 */
export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecord,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.byCard(variables.cardId) });
      void queryClient.invalidateQueries({ queryKey: ['recovery'] });
      void queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}

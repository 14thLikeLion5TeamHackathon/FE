import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createRecord, getRecords, getStatusTags } from '../../api/record';
import type { CreateRecordRequest } from '../../types/record';

const recordKeys = {
  byCard: (cardId: string) => ['record', 'card', cardId] as const,
  statusTags: ['statusTags'] as const,
};

/** 상태 태그 목록 조회 */
export function useStatusTags() {
  return useQuery({
    queryKey: recordKeys.statusTags,
    queryFn: getStatusTags,
  });
}

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
export function useCreateRecord(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateRecordRequest) => createRecord(cardId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.byCard(cardId) });
      void queryClient.invalidateQueries({ queryKey: ['card', 'records', cardId] });
      void queryClient.invalidateQueries({ queryKey: ['card', 'detail', cardId] });
      void queryClient.invalidateQueries({ queryKey: ['recovery'] });
      void queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}

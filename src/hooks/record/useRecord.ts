import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createRecord, getStatusTags } from '../../api/record';
import type { CreateRecordRequest } from '../../types/record';

const recordKeys = {
  statusTags: ['statusTags'] as const,
};

/** 상태 태그 목록 조회 */
export function useStatusTags() {
  return useQuery({
    queryKey: recordKeys.statusTags,
    queryFn: getStatusTags,
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
      void queryClient.invalidateQueries({ queryKey: ['card', 'records', cardId] });
      void queryClient.invalidateQueries({ queryKey: ['card', 'detail', cardId] });
      // 카드 목록에 카드별 최근 기록이 붙어 오고, 회복 탭이 그걸로 조립된다
      void queryClient.invalidateQueries({ queryKey: ['card', 'list'] });
      void queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}

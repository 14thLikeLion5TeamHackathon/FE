import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createCard, getCardDetail, getCardRecords, getCards, getTreatments } from '../../api/card';

const cardKeys = {
  all: ['card'] as const,
  list: ['card', 'list'] as const,
  detail: (cardId: string) => ['card', 'detail', cardId] as const,
  records: (cardId: string) => ['card', 'records', cardId] as const,
  treatments: (category?: string, q?: string) => ['card', 'treatments', category, q] as const,
};

/** GET /api/v1/cards — 케어카드 목록 */
export function useCards() {
  return useQuery({ queryKey: cardKeys.list, queryFn: getCards });
}

/** GET /api/v1/cards/{cardId} — 케어카드 상세 */
export function useCardDetail(cardId: string, params: { city: string; district: string }) {
  return useQuery({
    queryKey: cardKeys.detail(cardId),
    queryFn: () => getCardDetail(cardId, params),
    enabled: Boolean(cardId),
  });
}

/** GET /api/v1/cards/{cardId}/records — 카드별 이전 기록(회복 타임라인) */
export function useCardRecords(cardId: string) {
  return useQuery({
    queryKey: cardKeys.records(cardId),
    queryFn: () => getCardRecords(cardId),
    enabled: Boolean(cardId),
  });
}

/** 카드 생성 화면의 시술 목록. 카테고리 칩·검색어로 좁힌다. */
export function useTreatments(category?: string, q?: string) {
  return useQuery({
    queryKey: cardKeys.treatments(category, q),
    queryFn: () => getTreatments({ category, q }),
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cardKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['recovery'] });
      void queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}

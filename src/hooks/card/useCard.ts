import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createCard, getCardDetail, getCards, getTreatments } from '../../api/card';

const cardKeys = {
  all: ['card'] as const,
  list: ['card', 'list'] as const,
  detail: (cardId: string) => ['card', 'detail', cardId] as const,
  treatments: (category?: string, q?: string) => ['card', 'treatments', category, q] as const,
};

export function useCards() {
  return useQuery({ queryKey: cardKeys.list, queryFn: getCards });
}

export function useCardDetail(cardId: string) {
  return useQuery({
    queryKey: cardKeys.detail(cardId),
    queryFn: () => getCardDetail(cardId),
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

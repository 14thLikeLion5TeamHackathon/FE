import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createCard, getCardDetail, getCardRecords, getCards, getTreatments } from '../../api/card';
import type { TreatmentCategory } from '../../types/card';

const cardKeys = {
  all: ['card'] as const,
  list: ['card', 'list'] as const,
  // 위치가 응답의 todayCare(날씨 기반)를 바꾸므로 키에 포함한다.
  // 빠뜨리면 기준 위치를 옮겨도 이전 위치의 상세가 캐시에서 그대로 나온다.
  detail: (cardId: string, city: string, district: string) =>
    ['card', 'detail', cardId, city, district] as const,
  records: (cardId: string) => ['card', 'records', cardId] as const,
  treatments: (category?: TreatmentCategory, keyword?: string) => ['card', 'treatments', category, keyword] as const,
};

/** GET /api/v1/cards — 케어카드 목록 */
export function useCards() {
  return useQuery({ queryKey: cardKeys.list, queryFn: getCards });
}

/** GET /api/v1/cards/{cardId} — 케어카드 상세 */
export function useCardDetail(cardId: string, params: { city: string; district: string }) {
  return useQuery({
    queryKey: cardKeys.detail(cardId, params.city, params.district),
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

/**
 * 카드 생성 화면의 시술 목록. 카테고리 칩·검색어로 좁힌다.
 *
 * 서버가 페이징으로 바뀌어 한 번에 전부 오지 않는다. 남은 장을 이어 붙여야 해서
 * `useInfiniteQuery`를 쓴다 — 카테고리·검색어가 바뀌면 쿼리 키가 갈려 1장부터 다시 받는다.
 */
export function useTreatments(category?: TreatmentCategory, keyword?: string) {
  return useInfiniteQuery({
    queryKey: cardKeys.treatments(category, keyword),
    queryFn: ({ pageParam }) => getTreatments({ category, keyword, page: pageParam }),
    initialPageParam: 0,
    /**
     * `hasNext`를 그대로 믿되, 안 왔을 때는 `totalPages`로 물러난다.
     * 둘 다 없으면 멈춘다 — 끝을 모르는 채 계속 요청하면 같은 장을 무한히 받는다.
     */
    getNextPageParam: (lastPage, allPages) => {
      const next = (lastPage.page ?? allPages.length - 1) + 1;
      if (lastPage.hasNext != null) return lastPage.hasNext ? next : undefined;
      if (lastPage.totalPages != null) return next < lastPage.totalPages ? next : undefined;
      return undefined;
    },
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      // 회복 탭은 이제 별도 엔드포인트가 아니라 카드 목록으로 조립되므로 cardKeys.all이면 충분하다
      void queryClient.invalidateQueries({ queryKey: cardKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['today'] });
    },
  });
}

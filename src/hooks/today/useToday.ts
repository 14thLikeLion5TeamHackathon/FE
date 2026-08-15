import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getBriefing,
  getCalendarEvents,
  getCardMarkers,
  getChecklist,
  updateChecklistItem,
} from '../../api/today';
import { addDays, toKey } from '../../lib/date';
import type { TodayLocation } from '../../lib/location';
import { eventDateKey } from '../../types/today';

const todayKeys = {
  all: ['today'] as const,
  briefing: (date: string, location: TodayLocation) =>
    ['today', 'briefing', date, `${location.city}_${location.district}`] as const,
  checklist: () => ['today', 'checklist'] as const,
  events: () => ['today', 'events'] as const,
  cardMarkers: () => ['today', 'card-markers'] as const,
};

/** 관리 행동 브리핑. 날짜를 바꾸면 그 날짜 기준으로 다시 받는다 */
export function useBriefing(date: string, location: TodayLocation) {
  return useQuery({
    queryKey: todayKeys.briefing(date, location),
    queryFn: () => getBriefing(date, location),
  });
}

/** 오늘의 체크리스트. 서버가 날짜를 받지 않으므로 날짜와 무관하게 하나다 */
export function useChecklist() {
  return useQuery({
    queryKey: todayKeys.checklist(),
    queryFn: getChecklist,
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ checklistId, completed }: { checklistId: number; completed: boolean }) =>
      updateChecklistItem(checklistId, completed),
    /** 체크는 즉시 반응해야 하므로 서버 응답을 기다리지 않는다. */
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: todayKeys.checklist() });
    },
  });
}

/**
 * 케어 카드를 하나라도 가지고 있는지.
 *
 * 빈 상태 화면의 판단 기준이다. `cardJudgement`가 null인 걸로 판단하면 안 된다 —
 * 그건 "그 날짜에 안내할 판단이 없다"는 뜻이라, 회복 기간이 끝난 날짜에도 null이 온다.
 * 카드가 있는데 빈 상태를 띄우면 사용자가 자기 카드를 잃어버린 것처럼 본다.
 *
 * 아직 모르는 동안 null을 돌려준다 — 빈 상태가 한 번 깜빡였다 사라지지 않게 하려는 것.
 */
export function useHasCards(): boolean | null {
  const { data } = useQuery({
    queryKey: todayKeys.cardMarkers(),
    queryFn: getCardMarkers,
  });
  return data ? data.length > 0 : null;
}

/**
 * 예보 제공 일수. 오늘 포함 5일이고, 그 뒤 날짜는 캘린더에서 흐리게 처리한다.
 * 서버가 범위를 알려주지 않아 프론트 상수로 둔다 — BE에 문의 중이다.
 */
export const FORECAST_DAYS = 5;

/** 예보 마지막 날 */
export function forecastEnd(today: Date): Date {
  return addDays(today, FORECAST_DAYS - 1);
}

/**
 * 캘린더에 점을 찍을 날짜들.
 *
 * 서버가 날짜별 marked를 주지 않아서 두 곳에서 모아 조립한다 —
 * 구글 캘린더 일정이 있는 날, 그리고 카드의 회복 분기점(시술일·회복 종료일).
 * 캘린더를 연동하지 않은 사용자에게도 점이 보이려면 카드 쪽이 필요하다.
 */
export function useMarkedDates(calendarConnected: boolean) {
  const events = useQuery({
    queryKey: todayKeys.events(),
    queryFn: getCalendarEvents,
    /**
     * 미연동 상태에서 부르면 서버가 500을 낸다(빈 목록이 아니라).
     * 브리핑이 알려주는 연동 여부로 막는다 — 그 전에는 카드 분기점만으로 점을 찍는다.
     */
    enabled: calendarConnected,
  });

  const cards = useQuery({
    queryKey: todayKeys.cardMarkers(),
    queryFn: getCardMarkers,
  });

  const marked = new Set<string>();

  for (const event of events.data ?? []) {
    const key = eventDateKey(event);
    if (key) marked.add(key);
  }

  for (const card of cards.data ?? []) {
    marked.add(card.treatmentDate);
    if (card.recoveryTotalDays != null) {
      const treated = new Date(`${card.treatmentDate}T00:00:00`);
      if (!Number.isNaN(treated.getTime())) {
        marked.add(toKey(addDays(treated, card.recoveryTotalDays)));
      }
    }
  }

  return marked;
}

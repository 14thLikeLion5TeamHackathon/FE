import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getCards } from '../../api/card';
import { getBriefing, getCalendarEvents, getChecklist, updateChecklistItem } from '../../api/today';
import { addDays, toKey } from '../../lib/date';
import type { TodayLocation } from '../../lib/location';
import { eventDateKey } from '../../types/today';

/** 카드 목록은 카드 도메인과 같은 캐시를 쓴다 — 같은 리소스를 두 번 받지 않으려는 것 */
const cardKeys = { list: ['card', 'list'] as const };

const todayKeys = {
  all: ['today'] as const,
  /** location은 요청 파라미터가 아니라 캐시를 가르는 축이다 — useBriefing 주석 참고 */
  briefing: (date: string, location: TodayLocation) =>
    ['today', 'briefing', date, `${location.city}_${location.district}`] as const,
  checklist: (date: string) => ['today', 'checklist', date] as const,
  /** 날짜별 체크리스트 전부. 토글 후 무효화에 쓴다 */
  checklistAll: () => ['today', 'checklist'] as const,
  events: (startDate: string, endDate: string) => ['today', 'events', startDate, endDate] as const,
};

/**
 * 관리 행동 브리핑. 날짜를 바꾸면 그 날짜 기준으로 다시 받는다.
 *
 * `location`은 **요청에 실리지 않는다** — 서버가 저장된 기준 위치를 읽기 때문이다(api/today.ts).
 * 그래도 쿼리 키에 넣는 이유는, 위치를 바꾸면 캐시가 갈려 옛 지역 브리핑이 잠깐 비치는 걸 막기 위해서다.
 *
 * `enabled`로 예보 범위 밖을 막는다 — 브리핑은 안에서 날씨를 부르기 때문에 범위를 넘으면
 * 서버가 400을 낸다. 그건 오류가 아니라 "아직 예보가 없다"는 정상 상태다. 그대로 부르면
 * 화면이 400을 오류로 읽어 "불러오지 못했어요"를 띄운다.
 */
export function useBriefing(date: string, location: TodayLocation, enabled = true) {
  return useQuery({
    queryKey: todayKeys.briefing(date, location),
    queryFn: () => getBriefing(date),
    enabled,
  });
}

/** 체크리스트. 날짜를 바꾸면 그 날짜 기준으로 다시 받는다 */
export function useChecklist(date: string) {
  return useQuery({
    queryKey: todayKeys.checklist(date),
    queryFn: () => getChecklist(date),
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ checklistId, completed }: { checklistId: number; completed: boolean }) =>
      updateChecklistItem(checklistId, completed),
    /** 서버 응답이 온 뒤 목록을 다시 받는다. 낙관적 반영은 아직 없다 — 완료 수도 서버가 센다. */
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: todayKeys.checklistAll() });
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
  const { data } = useQuery({ queryKey: cardKeys.list, queryFn: getCards });
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
export function useMarkedDates(startDate: string, endDate: string, calendarConnected: boolean) {
  const events = useQuery({
    queryKey: todayKeys.events(startDate, endDate),
    queryFn: () => getCalendarEvents(startDate, endDate),
    /**
     * 미연동 상태에서 부르면 서버가 500을 낸다(빈 목록이 아니라).
     * 브리핑이 알려주는 연동 여부로 막는다 — 그 전에는 카드 분기점만으로 점을 찍는다.
     */
    enabled: calendarConnected,
  });

  const cards = useQuery({ queryKey: cardKeys.list, queryFn: getCards });

  // 매 렌더 새 Set을 만들면 이걸 받는 캘린더의 메모이제이션이 무력화된다.
  return useMemo(() => {
    const marked = new Set<string>();

    for (const event of events.data ?? []) {
      const key = eventDateKey(event);
      if (key) marked.add(key);
    }

    for (const card of cards.data ?? []) {
      // 시술일이 없으면 이 카드로는 찍을 점이 없다 — 종료일도 시술일에서 세기 때문이다.
      if (!card.treatmentDate) continue;
      marked.add(card.treatmentDate);

      // 회복 종료일. 서버가 시술일을 D+0으로 세므로(8/8 시술 → 8/16이 D+8)
      // 종료일도 시술일 + recoveryTotalDays가 맞다.
      // 기간을 모르면 종료일 점은 건너뛴다 — 0일로 치면 시술일에 종료 점이 겹쳐 찍힌다.
      const treated = new Date(`${card.treatmentDate}T00:00:00`);
      if (card.recoveryTotalDays != null && !Number.isNaN(treated.getTime())) {
        marked.add(toKey(addDays(treated, card.recoveryTotalDays)));
      }
    }

    return marked;
  }, [events.data, cards.data]);
}

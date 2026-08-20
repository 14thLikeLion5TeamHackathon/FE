import { useMemo, useSyncExternalStore } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getCards } from '../../api/card';
import { getBriefing, getCalendarEvents, getChecklist, updateChecklistItem } from '../../api/today';
import { useCalendarStatus } from '../calendar/useCalendar';
import { addDays, startOfDay, toKey } from '../../lib/date';
import type { TodayLocation } from '../../lib/location';
import { getScheduleDates, subscribeScheduleDates } from '../../lib/scheduleDates';
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
 * 안내가 시작되는 날 — **가장 이른 케어카드의 시술일**. 카드가 없으면 null이다.
 *
 * 그 이전 날짜는 브리핑도 체크리스트도 나올 수 없다. 안내를 만들어내는 게 결국 카드라서,
 * 카드가 생기기 전에는 서버에 물어볼 것 자체가 없다.
 *
 * 처음에는 **가입일**로 막으려 했는데 프론트가 그 날짜를 알 방법이 없다 —
 * `OnboardingResponse.createdAt`은 가입 순간 한 번 오고 저장하지 않으며,
 * `MyProfile`에는 아예 필드가 없다. 시술일은 뜻으로도 더 맞고, 카드 목록은
 * 캘린더 점을 찍느라 이미 받고 있어 요청도 늘지 않는다.
 *
 * **카드가 없으면 아무것도 막지 않는다.** 경계를 모르는 것과 경계가 오늘인 것은 다르다 —
 * 목록이 아직 안 왔을 때 과거를 통째로 잠그면, 잠깐이지만 앱이 고장난 것처럼 보인다.
 */
export function useCareStartDate(): Date | null {
  const { data } = useQuery({ queryKey: cardKeys.list, queryFn: getCards });

  return useMemo(() => {
    // 시술일은 "2026-08-15" 고정 폭이라 문자열 비교로 가장 이른 날을 고를 수 있다
    let earliest: string | null = null;
    for (const card of data ?? []) {
      if (!card.treatmentDate) continue;
      if (earliest === null || card.treatmentDate < earliest) earliest = card.treatmentDate;
    }
    return earliest ? startOfDay(new Date(`${earliest}T00:00:00`)) : null;
  }, [data]);
}

/**
 * 회복 구간 **밖**일 때 지금이 어디쯤인지.
 *
 * 카드는 있는데 그 날짜에 진행 중인 게 없으면 서버가 `cardJudgement: null`을 준다.
 * 그때 화면이 "회복 기간이 끝났거나 아직 시작 전이에요"라고만 하면 둘 중 뭔지 알 수 없어,
 * 카드를 만들어 둔 사용자는 등록이 잘못됐나 의심하게 된다 — 고장으로 읽히는 자리다.
 *
 * 답은 이미 받아 둔 카드 목록에 있다. 시술일과 회복 기간으로 구간을 세우면
 * 지금이 그 앞인지 뒤인지 사이인지 정확히 말할 수 있다. **서버에 더 물을 게 없다.**
 *
 * 구간 **안**이면 `active`로 알린다. 서버 브리핑이 오면 그쪽이 이기지만, 브리핑이 실패한
 * 날에는 이것만이라도 말할 수 있어야 한다 — "D-day 기준으로 안내드릴게요"라고 써 놓고
 * 정작 D-day를 못 보여주면 약속을 어기는 화면이 된다.
 */
export type RecoveryGap =
  | { kind: 'before'; treatmentName: string; date: Date }
  | { kind: 'between'; treatmentName: string; date: Date }
  | { kind: 'after'; treatmentName: string; date: Date }
  | { kind: 'active'; treatmentName: string; date: Date; dday: number };

export function useRecoveryGap(selected: Date): RecoveryGap | null {
  const { data } = useQuery({ queryKey: cardKeys.list, queryFn: getCards });

  return useMemo(() => {
    if (!data || data.length === 0) return null;

    const spans = data.flatMap((card) => {
      if (!card.treatmentDate) return [];
      const start = startOfDay(new Date(`${card.treatmentDate}T00:00:00`));
      if (Number.isNaN(start.getTime())) return [];

      // 기간을 모르면 시술 당일만 구간으로 본다 — 임의로 늘리면 없는 회복을 있다고 말하게 된다
      const end = addDays(start, card.recoveryTotalDays ?? 0);
      return [{ name: card.treatmentName ?? '시술', start, end }];
    });

    if (spans.length === 0) return null;

    /*
      구간 안이면 그 카드를 알린다. 여럿 겹치면 가장 최근에 시작한 것을 고른다 —
      회복 초기일수록 주의가 크고, 사용자도 방금 받은 시술을 먼저 떠올린다.
    */
    const running = spans
      .filter((span) => selected >= span.start && selected <= span.end)
      .sort((a, b) => b.start.getTime() - a.start.getTime())[0];

    if (running) {
      // 서버가 시술일을 D+0으로 센다(useMarkedDates 주석) — 여기도 같은 기준을 쓴다
      const dday = Math.round((selected.getTime() - running.start.getTime()) / 86_400_000);
      return { kind: 'active', treatmentName: running.name, date: running.start, dday };
    }

    const upcoming = spans
      .filter((span) => span.start > selected)
      .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
    const finished = spans
      .filter((span) => span.end < selected)
      .sort((a, b) => b.end.getTime() - a.end.getTime())[0];

    // 앞으로 올 시술이 있으면 그걸 가리킨다. 지나간 게 있으면 "사이", 없으면 "시작 전".
    if (upcoming) {
      return {
        kind: finished ? 'between' : 'before',
        treatmentName: upcoming.name,
        date: upcoming.start,
      };
    }

    // 남은 건 전부 끝난 경우. 가장 마지막에 끝난 회복을 말한다.
    return finished ? { kind: 'after', treatmentName: finished.name, date: finished.end } : null;
  }, [data, selected]);
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
 * 서버가 날짜별 marked를 주지 않아서 **세 곳에서** 모아 조립한다 —
 * 구글 캘린더 일정이 있는 날, 카드의 회복 분기점(시술일·회복 종료일),
 * 그리고 직접 입력한 일정이 있는 날.
 * 캘린더를 연동하지 않은 사용자에게도 점이 보이려면 뒤의 둘이 필요하다.
 */
/**
 * 연동된 구글 캘린더 일정. 보이는 달 전체를 한 번에 받는다.
 *
 * 캘린더 점과 일정 목록이 **같은 응답을 나눠 쓴다** — 쿼리 키가 같으므로 두 곳에서 불러도
 * 요청은 한 번이다. 따로 받으면 같은 데이터를 두 번 가져오고, 한쪽만 갱신돼 어긋난다.
 */
export function useCalendarEvents(startDate: string, endDate: string) {
  /**
   * 연동 여부는 **전용 상태 API로 본다.**
   *
   * 한때 브리핑 응답의 `calendarConnected`를 봤는데, 그러면 브리핑이 실패하거나 예보 범위
   * 밖이라 아예 부르지 않을 때 캘린더 일정까지 같이 사라졌다 — 서로 무관한 두 데이터가
   * 브리핑 하나에 묶여 있었다.
   *
   * 미연동일 때 이 요청을 막는 건 이제 필수가 아니다. 서버가 500 대신 200과 빈 배열을
   * 주도록 고쳐졌다(BE 확인). 그래도 막아 두는 건 연동한 적 없는 사용자에게 매번 나가는
   * 요청을 아끼려는 것뿐이고, 상태를 모르는 동안에도 막힌다 — 알게 되면 곧바로 받는다.
   */
  const { data: calendar } = useCalendarStatus();

  return useQuery({
    queryKey: todayKeys.events(startDate, endDate),
    queryFn: () => getCalendarEvents(startDate, endDate),
    enabled: calendar?.connected === true,
  });
}

export function useMarkedDates(startDate: string, endDate: string) {
  const events = useCalendarEvents(startDate, endDate);

  const cards = useQuery({ queryKey: cardKeys.list, queryFn: getCards });

  /**
   * 직접 입력한 일정이 있는 날짜. 쿼리가 아니라 로컬 저장소에서 온다 —
   * 서버에 날짜 범위로 물을 방법이 없어서다(lib/scheduleDates.ts 주석).
   */
  const manualDates = useSyncExternalStore(subscribeScheduleDates, getScheduleDates);

  // 매 렌더 새 Set을 만들면 이걸 받는 캘린더의 메모이제이션이 무력화된다.
  return useMemo(() => {
    const marked = new Set<string>();

    for (const date of manualDates) marked.add(date);

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
  }, [events.data, cards.data, manualDates]);
}

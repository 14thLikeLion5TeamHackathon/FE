import { z } from 'zod';

import { Level } from './common';

/**
 * 오늘 탭 — 브리핑 · 체크리스트 · 캘린더.
 * 블록 순서는 왜 → 무엇 → 근거다.
 *
 * 서버는 한 응답으로 주지 않는다. 브리핑과 체크리스트가 별도 엔드포인트고,
 * 캘린더에 찍을 점은 아예 계약에 없어서 프론트가 조립한다.
 */

/**
 * 서버의 한글 등급을 화면 색 단계로 옮긴다.
 * 모르는 값이 오면 색을 세게 칠하지 않고 MODERATE로 둔다 — 등급 문자열은 계약에 고정돼 있지 않다.
 *
 * 지금은 브리핑이 아니라 `/environment/weather` 응답(types/weather.ts)이 이 등급 문자열을 준다.
 */
export function toLevel(korean: string): Level {
  switch (korean) {
    case '좋음':
      return 'LOW';
    case '나쁨':
      return 'HIGH';
    case '매우나쁨':
    case '매우 나쁨':
      return 'SEVERE';
    default:
      return 'MODERATE';
  }
}

export const BriefingSchedule = z.object({
  /** 목록 키라서 이것만 필수로 둔다 — 없으면 그 일정을 그릴 수가 없다 */
  scheduleId: z.number(),
  title: z.string().nullish(),
  /** "오후 7:00". 종일 일정이면 null */
  time: z.string().nullish(),
  location: z.string().nullish(),
});
export type BriefingSchedule = z.infer<typeof BriefingSchedule>;

/**
 * 카드 기반 판단. **카드가 하나도 없으면 통째로 null이다.**
 * 브리핑 문장이 여기 들어 있어서, null이면 화면에 쓸 결론이 없다.
 */
export const CardJudgement = z.object({
  cardIds: z.array(z.number()).nullish(),
  /** 결론 문구. 오늘 해야 할 행동을 문장으로 */
  actionSentence: z.string().nullish(),
  cautionLevel: z.string().nullish(),
  /** 그렇게 판단한 이유. 화면에 칩으로 뿌린다 */
  reasons: z.array(z.string()).nullish(),
});
export type CardJudgement = z.infer<typeof CardJudgement>;

/**
 * 브리핑 응답.
 *
 * **`weather`와 `environment`가 계약에서 빠졌다.** 예전엔 브리핑이 기온·자외선·미세먼지를
 * 같이 실어 줬는데 스펙에서 통째로 사라졌고, 그 값들은 이제 `/environment/weather`가 준다
 * (types/weather.ts). 필수로 잡아 둔 채로 두면 브리핑 `.parse()`가 매번 터져 오늘 탭이 통째로
 * 에러 카드가 된다 — 실제로 그 상태였다.
 *
 * 나머지도 전부 느슨하다. 스웨거의 이 DTO는 `required`가 비어 있어 어느 필드든 빠질 수 있고,
 * 여기서 터지면 화면에 아무것도 안 남는다. 소비처(HomePage)는 이미 `?? []`·`?? false`로 받고 있다.
 */
export const BriefingResponse = z.object({
  /** YYYY-MM-DD */
  date: z.string().nullish(),
  schedules: z.array(BriefingSchedule).nullish(),
  cardJudgement: CardJudgement.nullish(),
  overallCautionLevel: z.string().nullish(),
  calendarConnected: z.boolean().nullish(),
});
export type BriefingResponse = z.infer<typeof BriefingResponse>;

/**
 * 체크리스트 항목.
 *
 * **토글 응답(PATCH)도 같은 스키마를 쓴다.** 여기서 파싱이 터지면 서버에는 체크가 반영됐는데
 * 화면만 실패로 보인다 — types/record.ts·types/schedule.ts가 겪은 사고와 같은 형태라 미리 푼다.
 * `checklistId`만 필수로 남긴다. 그게 없으면 어느 항목을 토글할지 정할 수가 없다.
 */
export const ChecklistItem = z.object({
  checklistId: z.number(),
  label: z.string().nullish(),
  /** 어느 카드에서 나온 행동인지. "스컬트라 D+7" */
  sourceLabel: z.string().nullish(),
  completed: z.boolean().nullish(),
});
export type ChecklistItem = z.infer<typeof ChecklistItem>;

export const TodayChecklistResponse = z.object({
  completedCount: z.number().nullish(),
  totalCount: z.number().nullish(),
  items: z.array(ChecklistItem).nullish(),
});
export type TodayChecklistResponse = z.infer<typeof TodayChecklistResponse>;

/**
 * 연동된 구글 캘린더 일정.
 * 스웨거에 응답 모양이 비어 있어(`additionalProperties: object`) 실제 응답을 보고 좁혀야 한다.
 * 그때까지는 날짜만 꺼낼 수 있으면 되므로 나머지 필드를 통과시킨다.
 */
export const CalendarEvent = z
  .object({
    /** 계약상 이름은 `eventDate`. "2026-08-15" 또는 "2026-08-15T19:00:00" */
    eventDate: z.string().optional(),
    // 미연동 상태라 실제 응답을 못 봤다. 계약이 어긋나도 점은 찍히게 후보를 남겨 둔다.
    date: z.string().optional(),
    startDate: z.string().optional(),
    start: z.string().optional(),
  })
  .passthrough();
export type CalendarEvent = z.infer<typeof CalendarEvent>;

/** 위 후보 중 실제로 온 필드에서 YYYY-MM-DD만 뽑는다 */
export function eventDateKey(event: CalendarEvent): string | null {
  const raw = event.eventDate ?? event.date ?? event.startDate ?? event.start;
  if (!raw) return null;
  const match = /^\d{4}-\d{2}-\d{2}/.exec(raw);
  return match ? match[0] : null;
}

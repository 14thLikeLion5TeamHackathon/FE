import { z } from 'zod';

import { Level } from './common';

/**
 * 오늘 탭 — 브리핑 · 체크리스트 · 캘린더.
 * 블록 순서는 왜 → 무엇 → 근거다.
 *
 * 서버는 한 응답으로 주지 않는다. 브리핑과 체크리스트가 별도 엔드포인트고,
 * 캘린더에 찍을 점은 아예 계약에 없어서 프론트가 조립한다.
 */

/** 자외선·미세먼지. 서버가 등급을 한글 문자열로 준다 */
export const LevelValue = z.object({
  /** "좋음" "보통" "나쁨" — enum이 아니라 문자열이다 */
  level: z.string(),
  value: z.number(),
});
export type LevelValue = z.infer<typeof LevelValue>;

/**
 * 서버의 한글 등급을 화면 색 단계로 옮긴다.
 * 모르는 값이 오면 색을 세게 칠하지 않고 MODERATE로 둔다 — 등급 문자열은 계약에 고정돼 있지 않다.
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

export const WeatherInfo = z.object({
  temp: z.number(),
  /** "온흐림" "맑음" */
  condition: z.string(),
});
export type WeatherInfo = z.infer<typeof WeatherInfo>;

export const BriefingSchedule = z.object({
  scheduleId: z.number(),
  title: z.string(),
  /** "오후 7:00". 종일 일정이면 null */
  time: z.string().nullable(),
  location: z.string().nullable(),
});
export type BriefingSchedule = z.infer<typeof BriefingSchedule>;

/**
 * 카드 기반 판단. **카드가 하나도 없으면 통째로 null이다.**
 * 브리핑 문장이 여기 들어 있어서, null이면 화면에 쓸 결론이 없다.
 */
export const CardJudgement = z.object({
  cardIds: z.array(z.number()),
  /** 결론 문구. 오늘 해야 할 행동을 문장으로 */
  actionSentence: z.string(),
  cautionLevel: z.string(),
  /** 그렇게 판단한 이유. 화면에 칩으로 뿌린다 */
  reasons: z.array(z.string()),
});
export type CardJudgement = z.infer<typeof CardJudgement>;

export const BriefingResponse = z.object({
  /** YYYY-MM-DD */
  date: z.string(),
  weather: WeatherInfo.nullable(),
  environment: z.object({ uv: LevelValue, dust: LevelValue }),
  schedules: z.array(BriefingSchedule),
  cardJudgement: CardJudgement.nullable(),
  overallCautionLevel: z.string().nullable(),
  calendarConnected: z.boolean(),
});
export type BriefingResponse = z.infer<typeof BriefingResponse>;

export const ChecklistItem = z.object({
  checklistId: z.number(),
  label: z.string(),
  /** 어느 카드에서 나온 행동인지. "스컬트라 D+7" */
  sourceLabel: z.string(),
  completed: z.boolean(),
});
export type ChecklistItem = z.infer<typeof ChecklistItem>;

export const TodayChecklistResponse = z.object({
  completedCount: z.number(),
  totalCount: z.number(),
  items: z.array(ChecklistItem),
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

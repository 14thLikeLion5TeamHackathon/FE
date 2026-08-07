import { z } from 'zod';

import { EvidenceChip, Level } from './common';

/**
 * 오늘 탭 — 캘린더 · 브리핑 · 체크리스트 · 근거.
 * 블록 순서는 왜 → 무엇 → 근거다.
 */

/** 자외선·미세먼지·습도 */
export const EnvMetric = z.object({
  label: z.string(),
  /** 표시값. "높음" "65%" 처럼 단위가 섞이므로 문자열로 받는다 */
  value: z.string(),
  level: Level,
});
export type EnvMetric = z.infer<typeof EnvMetric>;

export const ScheduleItem = z.object({
  id: z.string(),
  title: z.string(),
  /** "오후 7:00". 종일 일정이면 null */
  time: z.string().nullable(),
  place: z.string().nullable(),
  /** 직접 입력한 일정만 수정·삭제할 수 있다. 캘린더에서 온 건 읽기 전용 */
  editable: z.boolean(),
});
export type ScheduleItem = z.infer<typeof ScheduleItem>;

export const ChecklistItem = z.object({
  id: z.string(),
  label: z.string(),
  done: z.boolean(),
  /** 어느 카드에서 나온 행동인지. "스컬트라 D+7" */
  source: z.string(),
});
export type ChecklistItem = z.infer<typeof ChecklistItem>;

/** 브리핑이 어떤 상태로 내려오는지 */
export const BriefingState = z.enum([
  'FULL', // 정상
  'NO_CALENDAR', // 캘린더 미연동 또는 일정 0건
  'UNCLASSIFIED', // 일정 제목 분류 실패 → 시각·건수만 사용
  'OUT_OF_RANGE', // 예보 범위 밖
  'ERROR', // 데이터 로드 실패
]);
export type BriefingState = z.infer<typeof BriefingState>;

export const TodayBriefing = z.object({
  state: BriefingState,
  /** "8월 3일 (월)" */
  dateLabel: z.string(),
  /** "맑음 31°". 예보 범위 밖이면 null */
  weather: z.string().nullable(),
  /** 결론 문구. 오늘 해야 할 행동을 문장으로 */
  message: z.string(),
  metrics: z.array(EnvMetric),
  evidence: z.array(EvidenceChip),
  schedules: z.array(ScheduleItem),
});
export type TodayBriefing = z.infer<typeof TodayBriefing>;

/** 캘린더 날짜 한 칸 */
export const CalendarDay = z.object({
  /** YYYY-MM-DD */
  date: z.string(),
  /** 일정·자외선·회복 분기점이 있으면 점을 찍는다 */
  marked: z.boolean(),
  /** 예보 범위 밖이면 흐리게 처리 */
  outOfForecast: z.boolean(),
});
export type CalendarDay = z.infer<typeof CalendarDay>;

export const TodayResponse = z.object({
  briefing: TodayBriefing,
  checklist: z.array(ChecklistItem),
  calendar: z.array(CalendarDay),
  /** "예보는 8월 16일까지 제공돼요" */
  forecastNote: z.string().nullable(),
});
export type TodayResponse = z.infer<typeof TodayResponse>;

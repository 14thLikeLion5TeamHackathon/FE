import { z } from 'zod';

/**
 * 일정 직접 입력.
 * 외부 캘린더를 연동하지 않아도 서비스가 성립하게 하는 장치다.
 */

export const Schedule = z.object({
  id: z.string(),
  title: z.string(),
  /** YYYY.MM.DD */
  date: z.string(),
  /** "오후 7:00". 종일이면 null */
  time: z.string().nullable(),
  /** 자외선·이동 판단에 활용 */
  place: z.string().nullable(),
  /** 직접 입력한 일정만 수정·삭제할 수 있다 */
  editable: z.boolean(),
});
export type Schedule = z.infer<typeof Schedule>;

/* ── 실 API 등록·수정 (POST/PUT /api/v1/today/schedules) ────────────── */

export const ScheduleRequest = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  /** YYYY-MM-DD */
  eventDate: z.string().min(1, '날짜를 선택해주세요'),
  /** HH:mm:ss. 종일이면 null */
  eventTime: z.string().nullable(),
  location: z.string().nullable(),
});
export type ScheduleRequest = z.infer<typeof ScheduleRequest>;

/**
 * 스웨거의 응답 스키마에 required가 하나도 없다 — 어느 필드든 빠지거나 null로 올 수 있다.
 * 여기서 파싱이 터지면 **서버에는 일정이 등록됐는데** 화면은 실패로 보인다.
 * 지금 응답에서 실제로 읽는 값이 없으므로(성공 여부만 본다) 전부 느슨하게 받는다.
 */
export const ScheduleResponse = z.object({
  scheduleId: z.number().nullish(),
  title: z.string().nullish(),
  eventDate: z.string().nullish(),
  eventTime: z.string().nullish(),
  location: z.string().nullish(),
  /** "직접 입력" vs "캘린더 연동" 등 일정 출처. 읽기전용 판단은 이번 작업 범위 밖 */
  source: z.string().nullish(),
});
export type ScheduleResponse = z.infer<typeof ScheduleResponse>;

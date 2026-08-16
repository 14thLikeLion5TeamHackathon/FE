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

export const ScheduleResponse = z.object({
  scheduleId: z.number(),
  title: z.string(),
  eventDate: z.string(),
  eventTime: z.string().nullable(),
  location: z.string().nullable(),
  /** "직접 입력" vs "캘린더 연동" 등 일정 출처. 읽기전용 판단은 이번 작업 범위 밖 */
  source: z.string(),
});
export type ScheduleResponse = z.infer<typeof ScheduleResponse>;

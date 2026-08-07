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

export const ScheduleForm = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  date: z.string().min(1, '날짜를 선택해주세요'),
  time: z.string().nullable(),
  place: z.string().nullable(),
});
export type ScheduleForm = z.infer<typeof ScheduleForm>;

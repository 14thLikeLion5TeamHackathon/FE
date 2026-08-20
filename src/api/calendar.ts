import { CalendarStatus, toCalendarConnected, toCalendarEmail } from '../types/calendar';
import axiosInstance from './axiosInstance';
import type { ApiResponse } from './types';

/**
 * 구글 캘린더 연동.
 *
 * 연동 시작(`POST /api/v1/calendar/connect`)은 아직 붙이지 않았다 — 구글 인가 코드가
 * 필요한데 FE용 client_id가 아직 없다. 조회와 해제는 인가 코드 없이 되므로 먼저 연결한다.
 */

export type CalendarConnection = {
  connected: boolean;
  /** 연동된 구글 계정 주소. 서버가 안 주면 null이라 화면에서 감춘다 */
  email: string | null;
};

/**
 * 연동 상태. 미연동이면 에러가 아니라 빈 값(`data: null`)이 온다.
 *
 * **`getResult`를 태우지 않는다.** 스웨거에는 봉투 없는 맵으로 적혀 있지만(`weather`와
 * 같은 예외) 실제로는 봉투가 붙는다(BE 컨트롤러 확인 — `success`·`code`·`message`·`data`).
 * 스펙을 믿고 미리 벗기면 연동을 해도 조용히 영원히 "미연동"으로 보이므로, 본문을 통째로
 * 넘기고 `toCalendarConnected`·`toCalendarEmail`이 양쪽을 다 푼다.
 */
export async function getCalendarStatus(): Promise<CalendarConnection> {
  const res = await axiosInstance.get<unknown>('/api/v1/calendar/connect');
  const raw = CalendarStatus.parse(res.data);

  return { connected: toCalendarConnected(raw), email: toCalendarEmail(raw) };
}

/** 연동 해제 */
export async function disconnectCalendar(): Promise<void> {
  await axiosInstance.delete<ApiResponse>('/api/v1/calendar/connect');
}

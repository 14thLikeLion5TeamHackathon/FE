import { CalendarStatus, toCalendarConnected } from '../types/calendar';
import axiosInstance from './axiosInstance';
import type { ApiResponse } from './types';

/**
 * 구글 캘린더 연동.
 *
 * 연동 시작(`POST /api/v1/calendar/connect`)은 아직 붙이지 않았다 — 구글 인가 코드가
 * 필요한데 FE용 client_id가 아직 없다. 조회와 해제는 인가 코드 없이 되므로 먼저 연결한다.
 */

/**
 * 연동 상태. 미연동이면 에러가 아니라 빈 값(`data: null`)이 온다.
 *
 * **`getResult`를 태우지 않는다.** 스펙상 이 200 응답은 봉투 없는 맵인데(`weather`와 같은
 * 예외) 실서버에서는 봉투에 담긴 `data: null`을 봤다 — 어느 쪽인지 확정 못 했다(미확인).
 * 봉투를 미리 벗기면 봉투가 안 왔을 때 `undefined`가 되어, 연동을 해도 조용히 영원히
 * "미연동"으로 보인다. 그래서 본문을 통째로 넘기고 `toCalendarConnected`가 양쪽을 다 푼다.
 */
export async function getCalendarStatus(): Promise<boolean> {
  const res = await axiosInstance.get<unknown>('/api/v1/calendar/connect');
  return toCalendarConnected(CalendarStatus.parse(res.data));
}

/** 연동 해제 */
export async function disconnectCalendar(): Promise<void> {
  await axiosInstance.delete<ApiResponse>('/api/v1/calendar/connect');
}

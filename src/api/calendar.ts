import { CalendarStatus, toCalendarConnected } from '../types/calendar';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/**
 * 구글 캘린더 연동.
 *
 * 연동 시작(`POST /api/v1/calendar/connect`)은 아직 붙이지 않았다 — 구글 인가 코드가
 * 필요한데 FE용 client_id가 아직 없다. 조회와 해제는 인가 코드 없이 되므로 먼저 연결한다.
 */

/** 연동 상태. 미연동이면 서버가 `data: null`을 준다(에러가 아니다). */
export async function getCalendarStatus(): Promise<boolean> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/calendar/connect');
  return toCalendarConnected(CalendarStatus.parse(getResult(res)));
}

/** 연동 해제 */
export async function disconnectCalendar(): Promise<void> {
  await axiosInstance.delete<ApiResponse>('/api/v1/calendar/connect');
}

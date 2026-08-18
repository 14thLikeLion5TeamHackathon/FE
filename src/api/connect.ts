import axiosInstance from './axiosInstance';
import type { ApiResponse } from './types';

/**
 * 인가 코드를 BE에 넘겨 연동을 완성한다.
 *
 * `redirectUri`는 동의 화면을 열 때 쓴 값과 **글자 하나까지 같아야 한다.**
 * BE가 제공자에게 토큰을 교환하러 갈 때 이 값을 그대로 다시 보내는데,
 * 다르면 제공자가 `redirect_uri_mismatch`로 400을 낸다.
 * 그래서 호출부는 `lib/connect.ts`의 `redirectUri()`가 만든 값을 그대로 넘긴다.
 */

/** 구글 캘린더 연동 완료 */
export async function connectCalendar(authCode: string, redirectUri: string): Promise<void> {
  await axiosInstance.post<ApiResponse>('/api/v1/calendar/connect', { authCode, redirectUri });
}

/** 카카오 알림 연동 완료 */
export async function connectKakaoNotification(
  authCode: string,
  redirectUri: string,
): Promise<void> {
  await axiosInstance.post<ApiResponse>('/api/v1/notification/kakao', { authCode, redirectUri });
}

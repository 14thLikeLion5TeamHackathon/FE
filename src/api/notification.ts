import { KakaoNotificationResponse } from '../types/notification';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/**
 * 카카오톡 알림 수신 on/off.
 *
 * 연동 자체를 끊는 `DELETE /api/v1/mypage/notification/kakao`(api/user.ts)와 다르다 —
 * 이건 연동은 살려둔 채 수신 동의만 바꾼다. 다시 켤 때 동의 화면을 거치지 않아도 된다.
 */
export async function updateKakaoConsent(consent: boolean): Promise<KakaoNotificationResponse> {
  const res = await axiosInstance.patch<ApiResponse>('/api/v1/notification/kakao', { consent });
  return KakaoNotificationResponse.parse(getResult(res));
}

/**
 * 연동·수신 상태 조회.
 * 미연동이어도 200이 온다 — 그때는 `connected: false`만 담겨 온다.
 */
export async function getKakaoStatus(): Promise<KakaoNotificationResponse> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/notification/kakao');
  return KakaoNotificationResponse.parse(getResult(res));
}

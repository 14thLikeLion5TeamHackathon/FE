import { MyProfile, NotificationSettings } from '../types/user';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/**
 * API 함수는 항상 3단을 지킨다.
 * 1) axiosInstance 로 호출 (토큰 주입·에러 정규화는 인터셉터가 한다)
 * 2) getResult 로 공통 응답 봉투에서 result 만 꺼낸다
 * 3) Zod .parse() 로 끝낸다 — 계약이 어긋나면 여기서 즉시 터진다
 */
export async function getMyProfile(): Promise<MyProfile> {
  const res = await axiosInstance.get<ApiResponse>('/api/users/me');
  return MyProfile.parse(getResult(res));
}

export async function updateNotifications(
  next: NotificationSettings,
): Promise<NotificationSettings> {
  const res = await axiosInstance.patch<ApiResponse>('/api/users/me/notifications', next);
  return NotificationSettings.parse(getResult(res));
}

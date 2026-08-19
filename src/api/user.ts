import {
  MyProfile,
  OnboardingResponse,
  UpdateProfileRequest,
  UserIdResponse,
  type OnboardingRequest,
} from '../types/user';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/** POST /api/v1/auth/onboarding — 온보딩/회원정보등록 */
export async function postOnboarding(body: OnboardingRequest): Promise<OnboardingResponse> {
  const res = await axiosInstance.post<ApiResponse>('/api/v1/auth/onboarding', body);
  return OnboardingResponse.parse(getResult(res));
}

/** GET /api/v1/mypage/users/me — 개인정보 조회 */
export async function getMyProfile(): Promise<MyProfile> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/mypage/users/me');
  return MyProfile.parse(getResult(res));
}

/** PUT /api/v1/mypage/users/me — 개인정보 수정 */
export async function updateProfile(body: UpdateProfileRequest): Promise<UserIdResponse> {
  const res = await axiosInstance.put<ApiResponse>('/api/v1/mypage/users/me', body);
  return UserIdResponse.parse(getResult(res));
}

/** DELETE /api/v1/mypage/users/me — 회원 탈퇴 */
export async function deleteAccount(): Promise<void> {
  await axiosInstance.delete<ApiResponse>('/api/v1/mypage/users/me');
}

/**
 * POST /api/v1/mypage/auth/logout — 로그아웃.
 *
 * 같은 엔드포인트를 부르는 `api/auth.ts`의 `postLogout`이 따로 있었다. 둘이 갈라져 있으면
 * 한쪽만 고쳤을 때 어긋나므로 이쪽 하나로 합쳤다(응답 본문은 ApiResponseVoid라 볼 게 없다).
 */
export async function logout(): Promise<void> {
  await axiosInstance.post<ApiResponse>('/api/v1/mypage/auth/logout');
}

/** DELETE /api/v1/mypage/notification/kakao — 카카오 알림 연동 해제 */
export async function disconnectKakaoNotification(): Promise<void> {
  await axiosInstance.delete<ApiResponse>('/api/v1/mypage/notification/kakao');
}

/** PATCH /api/v1/mypage/location — 위치 정보 저장 (GPS 좌표 전송) */
export async function patchLocation(latitude: number, longitude: number): Promise<void> {
  await axiosInstance.patch<ApiResponse>('/api/v1/mypage/location', { latitude, longitude });
}

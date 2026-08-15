import { MyProfile, UpdateProfileRequest, UserIdResponse } from '../types/user';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

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

/** POST /api/v1/mypage/auth/logout — 로그아웃 */
export async function logout(): Promise<void> {
  await axiosInstance.post<ApiResponse>('/api/v1/mypage/auth/logout');
}

/** DELETE /api/v1/mypage/notification/kakao — 카카오 알림 연동 해제 */
export async function disconnectKakaoNotification(): Promise<void> {
  await axiosInstance.delete<ApiResponse>('/api/v1/mypage/notification/kakao');
}

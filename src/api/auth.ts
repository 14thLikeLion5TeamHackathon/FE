import { LoginResult } from '../types/auth';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/**
 * ⚠️ 경로·요청 본문 모두 BE와 합의 전이다 (#26). 지금은 MSW 목만 응답한다.
 * 실 카카오 OAuth는 BE의 리다이렉트 URI와 토큰 교환이 정해진 뒤에 붙인다.
 */
export async function postLogin(): Promise<LoginResult> {
  const res = await axiosInstance.post<ApiResponse>('/api/auth/login');
  return LoginResult.parse(getResult(res));
}

export async function postLogout(): Promise<null> {
  await axiosInstance.post<ApiResponse>('/api/auth/logout');
  return null;
}

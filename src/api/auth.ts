import { LogoutResult } from '../types/auth';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/**
 * 로그인 API는 없다. 소셜 로그인은 BE 리다이렉트로 처리되고 토큰은 콜백 쿼리스트링으로 온다
 * (docs/api-contract.md "인증 · 마이페이지 · 연동"). 콜백 처리는 pages/auth/AuthCallbackPage.tsx.
 */
export async function postLogout(): Promise<LogoutResult> {
  const res = await axiosInstance.post<ApiResponse>('/api/v1/mypage/auth/logout');
  return LogoutResult.parse(getResult(res));
}

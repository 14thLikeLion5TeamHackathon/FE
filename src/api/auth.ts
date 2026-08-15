import { LogoutResult } from '../types/auth';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

export async function postLogout(): Promise<LogoutResult> {
  const res = await axiosInstance.post<ApiResponse>('/api/v1/mypage/auth/logout');
  return LogoutResult.parse(getResult(res));
}

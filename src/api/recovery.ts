import { RecoveryResponse } from '../types/recovery';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

export async function getRecovery(): Promise<RecoveryResponse> {
  const res = await axiosInstance.get<ApiResponse>('/api/recovery');
  return RecoveryResponse.parse(getResult(res));
}

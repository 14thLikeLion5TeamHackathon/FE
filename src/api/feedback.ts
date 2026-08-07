import { AiFeedback } from '../types/feedback';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/** 기록을 저장하면 그 기록에 대한 피드백이 생성된다. */
export async function getFeedback(recordId: string): Promise<AiFeedback> {
  const res = await axiosInstance.get<ApiResponse>(`/api/records/${recordId}/feedback`);
  return AiFeedback.parse(getResult(res));
}

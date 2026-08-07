import { TodayResponse } from '../types/today';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/** 선택한 날짜 기준 브리핑·체크리스트·캘린더를 한 번에 받는다. */
export async function getToday(date?: string): Promise<TodayResponse> {
  const res = await axiosInstance.get<ApiResponse>('/api/today', { params: { date } });
  return TodayResponse.parse(getResult(res));
}

/** 체크리스트 항목 완료 토글 */
export async function toggleChecklistItem(itemId: string, done: boolean): Promise<void> {
  await axiosInstance.patch<ApiResponse>(`/api/today/checklist/${itemId}`, { done });
}

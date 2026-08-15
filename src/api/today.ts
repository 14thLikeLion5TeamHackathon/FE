import type { TodayLocation } from '../lib/location';
import { TodayResponse } from '../types/today';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/**
 * 선택한 날짜 기준 브리핑·체크리스트·캘린더를 한 번에 받는다.
 * 날씨·자외선·미세먼지가 위치에 따라 달라지므로 기준 위치를 함께 보낸다 —
 * 좌표 변환은 서버가 한다.
 */
export async function getToday(date?: string, location?: TodayLocation): Promise<TodayResponse> {
  const res = await axiosInstance.get<ApiResponse>('/api/today', {
    params: { date, city: location?.city, district: location?.district },
  });
  return TodayResponse.parse(getResult(res));
}

/** 체크리스트 항목 완료 토글 */
export async function toggleChecklistItem(itemId: string, done: boolean): Promise<void> {
  await axiosInstance.patch<ApiResponse>(`/api/today/checklist/${itemId}`, { done });
}

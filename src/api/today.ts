import type { TodayLocation } from '../lib/location';
import {
  BriefingResponse,
  CalendarEvent,
  ChecklistItem,
  TodayChecklistResponse,
} from '../types/today';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/**
 * 관리 행동 브리핑.
 * 날씨·자외선·미세먼지가 위치에 따라 달라지므로 기준 위치를 함께 보낸다 — 좌표 변환은 서버가 한다.
 * 세 파라미터 모두 필수다.
 */
export async function getBriefing(
  date: string,
  location: TodayLocation,
): Promise<BriefingResponse> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/today/briefing', {
    params: { date, city: location.city, district: location.district },
  });
  return BriefingResponse.parse(getResult(res));
}

/**
 * 체크리스트. `date`는 선택값이고, 안 보내면 서버가 오늘 기준으로 준다.
 * 캘린더에서 다른 날을 고르면 그 날짜 것이 와야 하므로 항상 실어 보낸다.
 */
export async function getChecklist(date?: string): Promise<TodayChecklistResponse> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/today/checklist', {
    params: date ? { date } : undefined,
  });
  return TodayChecklistResponse.parse(getResult(res));
}

/** 체크리스트 항목 완료 상태 변경 */
export async function updateChecklistItem(
  checklistId: number,
  completed: boolean,
): Promise<ChecklistItem> {
  const res = await axiosInstance.patch<ApiResponse>(`/api/v1/today/checklist/${checklistId}`, {
    completed,
  });
  return ChecklistItem.parse(getResult(res));
}

/**
 * 연동된 구글 캘린더 일정. 캘린더에 점을 찍는 데 쓴다 —
 * 서버가 날짜별 marked를 따로 주지 않아서 프론트가 조립해야 한다.
 *
 * 보이는 달 전체를 한 번에 받는다. 날짜를 옮길 때마다 다시 부르지 않으려는 것.
 */
export async function getCalendarEvents(
  startDate: string,
  endDate: string,
): Promise<CalendarEvent[]> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/today/calendar/events', {
    params: { startDate, endDate },
  });
  return toCalendarEvents(getResult(res));
}

function toCalendarEvents(result: unknown): CalendarEvent[] {
  if (typeof result === 'object' && result !== null && 'schedules' in result) {
    const { schedules } = result as { schedules: unknown };
    if (Array.isArray(schedules)) return parseEvents(schedules);
  }

  // 계약 확인 전 코드가 받아주던 형태들. 미연동 상태라 실제 응답을 아직 못 봐서 남겨 둔다.
  const list = Array.isArray(result)
    ? result
    : typeof result === 'object' && result !== null
      ? Object.values(result).find(Array.isArray)
      : null;
  return Array.isArray(list) ? parseEvents(list) : [];
}

/** 날짜를 못 읽는 항목은 버린다 — 점 표시는 부가 정보라 하나가 어긋나도 화면을 막지 않는다. */
function parseEvents(list: unknown[]): CalendarEvent[] {
  return list.flatMap((item) => {
    const parsed = CalendarEvent.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

import type { TodayLocation } from '../lib/location';
import {
  BriefingResponse,
  CalendarEvent,
  ChecklistItem,
  TodayCardMarker,
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

/** 오늘의 체크리스트. 날짜를 받지 않는다 — 항상 오늘 것이다 */
export async function getChecklist(): Promise<TodayChecklistResponse> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/today/checklist');
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
 * 조회 기간 파라미터는 계약에 없다. 전체를 받아 한 번만 캐시하고,
 * 어느 달을 보든 그 응답을 다시 쓴다 — 달을 넘길 때마다 같은 응답을 다시 받지 않으려는 것.
 */
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/today/calendar/events');
  return toCalendarEvents(getResult(res));
}

/**
 * 캘린더 점을 찍을 카드 날짜.
 * 카드 도메인이 아니라 오늘 탭에 두는 이유는 `types/today.ts`의 `TodayCardMarker` 주석 참고.
 */
export async function getCardMarkers(): Promise<TodayCardMarker[]> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/cards');
  const result = getResult(res);
  if (!Array.isArray(result)) return [];
  return result.flatMap((item) => {
    const parsed = TodayCardMarker.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
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

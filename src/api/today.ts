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
 *
 * **파라미터는 `date` 하나다.** 예전에는 city/district를 같이 보냈지만 스펙에서 빠졌고,
 * 지금은 서버가 저장된 기준 위치를 읽는다(`PATCH /api/v1/mypage/location`, api/location.ts).
 * 그래서 위치를 바꿀 때는 저장을 먼저 하고 이 쿼리를 무효화해야 한다 — useTodayLocation이 그 순서를 맡는다.
 */
export async function getBriefing(date: string): Promise<BriefingResponse> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/today/briefing', {
    params: { date },
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
  // 스펙상 이 응답에는 공통 봉투가 없다(벌거벗은 맵). `getResult`를 태우면 `data.data`를 읽어
  // 항상 undefined가 되고, 그러면 에러 없이 점이 하나도 안 찍힌다 — 그래서 본문을 그대로 넘긴다.
  // 봉투가 오는 경우도 toCalendarEvents가 한 겹 벗겨 받는다(미연동이라 실응답을 아직 못 봤다).
  const res = await axiosInstance.get<unknown>('/api/v1/today/calendar/events', {
    params: { startDate, endDate },
  });
  return toCalendarEvents(res.data);
}

function toCalendarEvents(input: unknown): CalendarEvent[] {
  // 봉투가 올 수도, 안 올 수도 있다(위 주석). 있으면 한 겹 벗기고 없으면 그대로 본다.
  const result =
    typeof input === 'object' && input !== null && 'data' in input
      ? (input as { data: unknown }).data
      : input;

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

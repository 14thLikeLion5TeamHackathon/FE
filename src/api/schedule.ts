import { Schedule, ScheduleRequest, ScheduleResponse } from '../types/schedule';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import { HttpStatus, type ApiError, type ApiResponse } from './types';

/**
 * 일정 단건 조회 — **서버에 없다.**
 *
 * 스웨거에 `/api/v1/today/schedules`는 POST, `{scheduleId}`는 PUT/DELETE만 있다.
 * 원래 여기서 `/api/schedules/{id}`를 불렀는데 그건 목이 가려주던 옛 경로라,
 * 목을 걷어낸 지금은 404가 난다. 지금은 수정 화면으로 가는 링크가 없어 호출되지 않는다.
 *
 * 수정 버튼을 붙일 때는 둘 중 하나다 —
 * BE에 단건 조회를 요청하거나, 목록을 가진 화면에서 라우터 state로 넘기거나.
 * 잘못된 경로를 남겨두면 그때 404의 원인을 다시 찾게 되므로 여기서 막는다.
 */
export async function getSchedule(scheduleId: string): Promise<Schedule> {
  throw new Error(
    `일정 단건 조회 API가 서버에 없습니다 (scheduleId=${scheduleId}, api/schedule.ts 주석 참고)`,
  );
}

/** eventTime을 뺀 사본. 종일 일정에서 null이 거부될 때(400) 필드 자체를 생략해 재시도하는 용도 */
function withoutEventTime(body: ScheduleRequest): Omit<ScheduleRequest, 'eventTime'> {
  const { title, eventDate, location } = body;
  return { title, eventDate, location };
}

/**
 * 종일 일정의 eventTime 처리 방식이 Swagger에 명확하지 않다.
 * 우선 null로 보내고, 그 경우에 한해 400이 오면 필드 자체를 생략해 한 번 더 시도한다.
 * TODO: BE와 실제 동작이 확인되면 이 fallback은 제거한다.
 */
async function withAllDayFallback<T>(
  body: ScheduleRequest,
  attempt: (payload: ScheduleRequest | Omit<ScheduleRequest, 'eventTime'>) => Promise<T>,
): Promise<T> {
  try {
    return await attempt(body);
  } catch (error) {
    if (body.eventTime === null && (error as ApiError).status === HttpStatus.BAD_REQUEST) {
      return await attempt(withoutEventTime(body));
    }
    throw error;
  }
}

export async function createSchedule(body: ScheduleRequest): Promise<ScheduleResponse> {
  const res = await withAllDayFallback(body, (payload) =>
    axiosInstance.post<ApiResponse>('/api/v1/today/schedules', payload),
  );
  return ScheduleResponse.parse(getResult(res));
}

export async function updateSchedule(
  scheduleId: string,
  body: ScheduleRequest,
): Promise<ScheduleResponse> {
  const res = await withAllDayFallback(body, (payload) =>
    axiosInstance.put<ApiResponse>(`/api/v1/today/schedules/${scheduleId}`, payload),
  );
  return ScheduleResponse.parse(getResult(res));
}

export async function deleteSchedule(scheduleId: string): Promise<void> {
  await axiosInstance.delete<ApiResponse>(`/api/v1/today/schedules/${scheduleId}`);
}

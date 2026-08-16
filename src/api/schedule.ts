import { Schedule, ScheduleRequest, ScheduleResponse } from '../types/schedule';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import { HttpStatus, type ApiError, type ApiResponse } from './types';

export async function getSchedule(scheduleId: string): Promise<Schedule> {
  const res = await axiosInstance.get<ApiResponse>(`/api/schedules/${scheduleId}`);
  return Schedule.parse(getResult(res));
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

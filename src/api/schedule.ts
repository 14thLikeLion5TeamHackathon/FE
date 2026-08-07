import { Schedule, ScheduleForm } from '../types/schedule';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

export async function getSchedule(scheduleId: string): Promise<Schedule> {
  const res = await axiosInstance.get<ApiResponse>(`/api/schedules/${scheduleId}`);
  return Schedule.parse(getResult(res));
}

export async function createSchedule(body: ScheduleForm): Promise<Schedule> {
  const res = await axiosInstance.post<ApiResponse>('/api/schedules', body);
  return Schedule.parse(getResult(res));
}

export async function updateSchedule(scheduleId: string, body: ScheduleForm): Promise<Schedule> {
  const res = await axiosInstance.put<ApiResponse>(`/api/schedules/${scheduleId}`, body);
  return Schedule.parse(getResult(res));
}

export async function deleteSchedule(scheduleId: string): Promise<void> {
  await axiosInstance.delete<ApiResponse>(`/api/schedules/${scheduleId}`);
}

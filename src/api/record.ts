import { CreateRecordRequest, CreateRecordResponse, RecordDetail } from '../types/record';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';
import { z } from 'zod';

/** 카드 상세의 회복 기록 타임라인 */
export async function getRecords(cardId: string): Promise<RecordDetail[]> {
  const res = await axiosInstance.get<ApiResponse>(`/api/cards/${cardId}/records`);
  return z.array(RecordDetail).parse(getResult(res));
}

export async function createRecord(body: CreateRecordRequest): Promise<CreateRecordResponse> {
  const res = await axiosInstance.post<ApiResponse>('/api/records', body);
  return CreateRecordResponse.parse(getResult(res));
}

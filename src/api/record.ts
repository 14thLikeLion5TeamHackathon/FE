import { CreateRecordRequest, CreateRecordResponse, StatusTag } from '../types/record';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';
import { z } from 'zod';

/** 상태 태그 목록 조회 */
export async function getStatusTags(): Promise<StatusTag[]> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/now/status-tags');
  return z.array(StatusTag).parse(getResult(res));
}

/** 현재 상태 기록 등록 (multipart/form-data) */
export async function createRecord(
  cardId: string,
  body: CreateRecordRequest,
): Promise<CreateRecordResponse> {
  const formData = new FormData();
  formData.append('photo', body.photo);
  formData.append('statusDescription', body.statusDescription);
  formData.append('tags', body.tags);

  const res = await axiosInstance.post<ApiResponse>(
    `/api/v1/now/care-cards/${cardId}/records`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return CreateRecordResponse.parse(getResult(res));
}

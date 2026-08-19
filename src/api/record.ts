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
  // 서버 `photo`는 array of binary — 같은 키로 여러 번 append해야 배열로 들어간다.
  body.photos.forEach((photo) => formData.append('photo', photo));
  formData.append('statusDescription', body.statusDescription);
  formData.append('tags', body.tags);

  // axiosInstance는 기본 헤더로 Content-Type: application/json을 깔아 둔다.
  // FormData를 보낼 땐 boundary가 포함된 Content-Type을 브라우저가 채워야 하므로,
  // 여기서 'multipart/form-data'로 직접 고정하면 boundary가 빠져 서버가 파싱하지 못한다.
  // 그렇다고 헤더 옵션을 아예 생략하면 인스턴스 기본값인 application/json이 그대로 적용되고,
  // axios가 FormData를 JSON으로 잘못 직렬화해 버린다. undefined로 명시해서 기본값을 지워야
  // 브라우저가 boundary 포함 Content-Type을 자동으로 채운다.
  const res = await axiosInstance.post<ApiResponse>(
    `/api/v1/now/care-cards/${cardId}/records`,
    formData,
    { headers: { 'Content-Type': undefined } },
  );
  return CreateRecordResponse.parse(getResult(res));
}

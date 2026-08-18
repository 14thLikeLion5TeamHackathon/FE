import {
  CardDetail,
  CareCard,
  CreateCardRequest,
  CreateCardResponse,
  Treatment,
  type TreatmentCategory,
  toServerCategory,
} from '../types/card';
import { RecordTimelineResponse } from '../types/record';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';
import { z } from 'zod';

/** GET /api/v1/cards — 케어카드 목록 조회 (카드별 최근 기록 포함) */
export async function getCards(): Promise<CareCard[]> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/cards');
  return z.array(CareCard).parse(getResult(res));
}

/** GET /api/v1/cards/{cardId} — 케어카드 상세 조회 */
export async function getCardDetail(
  cardId: string,
  params: { city: string; district: string },
): Promise<CardDetail> {
  const res = await axiosInstance.get<ApiResponse>(`/api/v1/cards/${cardId}`, { params });
  return CardDetail.parse(getResult(res));
}

/** GET /api/v1/cards/{cardId}/records — 카드별 이전 기록(회복 타임라인) 조회 */
export async function getCardRecords(cardId: string): Promise<RecordTimelineResponse> {
  const res = await axiosInstance.get<ApiResponse>(`/api/v1/cards/${cardId}/records`);
  return RecordTimelineResponse.parse(getResult(res));
}

/**
 * 카드 생성 화면의 시술 목록. category·keyword로 좁힌다.
 *
 * 카테고리는 화면 코드(`DRUG`)가 아니라 **서버 표기(`약물·주사`)로 물어야 한다** —
 * 코드로 물으면 서버가 조용히 0건을 준다(에러가 아니라 빈 목록이라 원인이 안 보인다).
 */
export async function getTreatments(params: {
  category?: TreatmentCategory;
  keyword?: string;
}): Promise<Treatment[]> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/create/treatments', {
    params: {
      category: params.category && toServerCategory(params.category),
      keyword: params.keyword,
    },
  });
  return z.array(Treatment).parse(getResult(res));
}

export async function createCard(body: CreateCardRequest): Promise<CreateCardResponse> {
  const res = await axiosInstance.post<ApiResponse>('/api/v1/create/care-cards', body);
  return CreateCardResponse.parse(getResult(res));
}
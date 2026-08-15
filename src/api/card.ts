import { CardDetail, CardRecords, CareCard, CreateCardRequest, Treatment } from '../types/card';
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
export async function getCardRecords(cardId: string): Promise<CardRecords> {
  const res = await axiosInstance.get<ApiResponse>(`/api/v1/cards/${cardId}/records`);
  return CardRecords.parse(getResult(res));
}

/** 카드 생성 화면의 시술 목록. category·keyword로 좁힌다. */
export async function getTreatments(params: { category?: string; keyword?: string }): Promise<Treatment[]> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/create/treatments', { params });
  return z.array(Treatment).parse(getResult(res));
}

export async function createCard(body: CreateCardRequest): Promise<CareCard> {
  const res = await axiosInstance.post<ApiResponse>('/api/v1/create/care-cards', body);
  return CareCard.parse(getResult(res));
}

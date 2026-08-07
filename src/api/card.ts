import { CardDetail, CareCard, CreateCardRequest, Treatment } from '../types/card';
import axiosInstance from './axiosInstance';
import { getResult } from './helpers';
import type { ApiResponse } from './types';
import { z } from 'zod';

export async function getCards(): Promise<CareCard[]> {
  const res = await axiosInstance.get<ApiResponse>('/api/cards');
  return z.array(CareCard).parse(getResult(res));
}

export async function getCardDetail(cardId: string): Promise<CardDetail> {
  const res = await axiosInstance.get<ApiResponse>(`/api/cards/${cardId}`);
  return CardDetail.parse(getResult(res));
}

/** 카드 생성 화면의 시술 목록. category·q로 좁힌다. */
export async function getTreatments(params: { category?: string; q?: string }): Promise<Treatment[]> {
  const res = await axiosInstance.get<ApiResponse>('/api/treatments', { params });
  return z.array(Treatment).parse(getResult(res));
}

export async function createCard(body: CreateCardRequest): Promise<CareCard> {
  const res = await axiosInstance.post<ApiResponse>('/api/cards', body);
  return CareCard.parse(getResult(res));
}

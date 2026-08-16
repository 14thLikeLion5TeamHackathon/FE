import {
  CardDetail,
  CareCard,
  CreateCardRequest,
  CreateCardResponse,
  Treatment,
} from '../types/card';
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

/** 카드 생성 화면의 시술 목록. category·keyword로 좁힌다. */
export async function getTreatments(params: {
  category?: string;
  keyword?: string;
}): Promise<Treatment[]> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/create/treatments', { params });
  return z.array(Treatment).parse(getResult(res));
}

export async function createCard(body: CreateCardRequest): Promise<CreateCardResponse> {
  const res = await axiosInstance.post<ApiResponse>('/api/v1/create/care-cards', body);
  return CreateCardResponse.parse(getResult(res));
}

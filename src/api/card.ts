import {
  CardDetail,
  CareCard,
  CreateCardRequest,
  CreateCardResponse,
  TreatmentPage,
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
 * 한 번에 받아올 시술 수.
 *
 * 서버 기본값은 6이다. 그대로 두면 카테고리를 누를 때마다 여섯 줄만 나와 "더 보기"를
 * 반복해서 눌러야 한다 — 고르는 화면이라 한눈에 훑을 수 있어야 해서 넉넉히 요청한다.
 */
const TREATMENT_PAGE_SIZE = 20;

/**
 * 카드 생성 화면의 시술 목록. category·keyword로 좁히고 page 단위로 받는다.
 *
 * 카테고리는 화면 코드(`DRUG`)가 아니라 **서버 표기(`약물·주사`)로 물어야 한다** —
 * 코드로 물으면 서버가 조용히 0건을 준다(에러가 아니라 빈 목록이라 원인이 안 보인다).
 *
 * **응답이 배열에서 페이지 객체로 바뀌었다.** 예전처럼 `z.array()`로 받으면 파싱이 터져
 * 시술 목록이 통째로 빈 화면이 된다. `page`는 0부터다.
 */
export async function getTreatments(params: {
  category?: TreatmentCategory;
  keyword?: string;
  page?: number;
}): Promise<TreatmentPage> {
  const res = await axiosInstance.get<ApiResponse>('/api/v1/create/treatments', {
    params: {
      category: params.category && toServerCategory(params.category),
      keyword: params.keyword,
      page: params.page ?? 0,
      size: TREATMENT_PAGE_SIZE,
    },
  });
  return TreatmentPage.parse(getResult(res));
}

export async function createCard(body: CreateCardRequest): Promise<CreateCardResponse> {
  const res = await axiosInstance.post<ApiResponse>('/api/v1/create/care-cards', body);
  return CreateCardResponse.parse(getResult(res));
}
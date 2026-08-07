import { z } from 'zod';

import { Intensity, SymptomKey } from './common';

/**
 * 상태 기록 — 사진·메모·증상 강도.
 * 강도는 사용자가 직접 매긴다(AI 오판 위험 없음). 회복 곡선의 데이터 소스.
 */

export const SymptomEntry = z.object({
  key: SymptomKey,
  intensity: Intensity,
});
export type SymptomEntry = z.infer<typeof SymptomEntry>;

export const RecordDetail = z.object({
  id: z.string(),
  cardId: z.string(),
  /** MM.DD */
  recordedAt: z.string(),
  dday: z.number().int(),
  photoUrls: z.array(z.string()),
  /** 지금 상태를 적은 자유 텍스트 */
  memo: z.string(),
  symptoms: z.array(SymptomEntry),
});
export type RecordDetail = z.infer<typeof RecordDetail>;

/**
 * 기록 생성 요청.
 *
 * ⚠️ 사진 업로드 방식(presigned URL / multipart)이 BE와 아직 안 정해졌다.
 *    지금은 업로드 후 받은 URL을 넘기는 형태로 두고, 정해지면 이 부분만 고친다.
 */
export const CreateRecordRequest = z.object({
  cardId: z.string(),
  photoUrls: z.array(z.string()),
  memo: z.string(),
  symptoms: z.array(SymptomEntry),
});
export type CreateRecordRequest = z.infer<typeof CreateRecordRequest>;

/** 기록을 저장하면 AI 피드백 화면으로 넘어간다 */
export const CreateRecordResponse = z.object({
  recordId: z.string(),
});
export type CreateRecordResponse = z.infer<typeof CreateRecordResponse>;

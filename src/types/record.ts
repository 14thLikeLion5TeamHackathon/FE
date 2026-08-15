import { z } from 'zod';

/** 상태 태그 (목록 조회용) */
export const StatusTag = z.object({
  tagId: z.number(),
  name: z.string(),
});
export type StatusTag = z.infer<typeof StatusTag>;

/** 태그 항목 (상태 태그 + 강도, 기록 응답용) */
export const RecordTag = z.object({
  tagId: z.number(),
  name: z.string(),
  intensity: z.number(),
});
export type RecordTag = z.infer<typeof RecordTag>;

/** 기록 상세 (응답 DTO) */
export const RecordDetail = z.object({
  recordId: z.number(),
  cardId: z.number(),
  photoUrl: z.string(),
  statusDescription: z.string(),
  recordedAt: z.string(),
  tags: z.array(RecordTag),
  dday: z.number(),
});
export type RecordDetail = z.infer<typeof RecordDetail>;

/**
 * 기록 생성 요청 — multipart/form-data로 전송.
 * cardId는 path parameter로 전달.
 * POST /api/v1/now/care-cards/{cardId}/records
 */
export const CreateRecordRequest = z.object({
  photo: z.instanceof(File),
  statusDescription: z.string(),
  tags: z.string(),
});
export type CreateRecordRequest = z.infer<typeof CreateRecordRequest>;

/** 기록 생성 응답 — RecordDetail과 동일 구조 */
export const CreateRecordResponse = RecordDetail;
export type CreateRecordResponse = z.infer<typeof CreateRecordResponse>;

import { Intensity, SymptomKey, normalizeDday } from './common';
import { AiFeedback } from './card';
import { z } from 'zod';

/** 상태 태그 (목록 조회용) */
export const StatusTag = z.object({
  tagId: z.number(),
  name: z.string(),
});
export type StatusTag = z.infer<typeof StatusTag>;

/**
 * 서버가 증상 강도를 담을 때 쓰는 키.
 * 화면 상수(SymptomKey)는 대문자라 철자가 다르다 — 계약 경계에서만 이 맵으로 옮긴다.
 */
export const SYMPTOM_TAG_KEY: Record<SymptomKey, string> = {
  REDNESS: 'redness',
  SWELLING: 'swelling',
  PAIN: 'pain',
  DRYNESS: 'dryness',
};

/**
 * 등록 응답의 tags. 스웨거가 `additionalProperties: integer`라 키를 4종으로 못 박지 않는다.
 * 여기서 키를 고정하면 서버가 증상을 하나 늘리는 순간 파싱이 터진다.
 */
export const RecordTagMap = z.record(z.string(), z.number().int());
export type RecordTagMap = z.infer<typeof RecordTagMap>;

/**
 * 기록 생성 요청 — multipart/form-data로 전송. cardId는 path parameter.
 * POST /api/v1/now/care-cards/{cardId}/records
 *
 * photos는 서버의 `photo` 필드에 같은 키로 여러 번 append해서 배열로 만든다.
 * tags는 `{"redness":3,"swelling":0,...}`을 JSON 문자열로 직렬화한 값이다.
 */
export const CreateRecordRequest = z.object({
  photos: z.array(z.instanceof(File)).min(1),
  statusDescription: z.string(),
  tags: z.string(),
});
export type CreateRecordRequest = z.infer<typeof CreateRecordRequest>;

/* ── 기록 응답이 두 벌인 이유 ──────────────────────────────
 * 같은 기록인데 서버가 형태를 다르게 준다.
 *   등록 응답(CareRecordResponse)   : tags가 `{ redness: 3, ... }` 객체
 *   타임라인(CareRecordTimelineItem): redness/swelling/pain/dryness가 평평한 개별 필드
 * 한 타입으로 억지로 합치면 어느 쪽이든 `.parse()`가 터지므로 계약대로 나눠 둔다.
 * BE가 형태를 통일하면 그때 한 벌로 줄인다.
 * ─────────────────────────────────────────────────────── */

/**
 * 기록 등록 응답 (POST /api/v1/now/care-cards/{cardId}/records)
 *
 * **`recordId` 말고는 전부 선택으로 둔다.** 화면이 쓰는 건 그 값 하나뿐인데(등록 직후
 * 피드백 화면으로 이동), 나머지를 필수로 잡았다가 하나만 어긋나도 `.parse()`가 터진다.
 * 그러면 서버에는 기록이 **저장된 채로** 화면은 안 넘어가고, 사용자는 실패한 줄 알고
 * 다시 눌러 같은 기록을 두 번 만든다 — 실제로 그렇게 됐다(dday를 필수로 잡았는데
 * 서버가 `dDay`로 줬다).
 */
export const CreateRecordResponse = z.preprocess(
  normalizeDday,
  z.object({
    recordId: z.number(),
    cardId: z.number().nullish(),
    photoUrls: z.array(z.string()).nullish(),
    statusDescription: z.string().nullish(),
    recordedAt: z.string().nullish(),
    tags: RecordTagMap.nullish(),
    dday: z.number().nullish(),
  }),
);
export type CreateRecordResponse = z.infer<typeof CreateRecordResponse>;

/** 타임라인 기록 항목 (GET /api/v1/cards/{cardId}/records) */
export const RecordTimelineItem = z.preprocess(
  // 타임라인도 D-day를 `dDay`로 준다 — 카드와 같은 사정이다(types/common.ts 참고)
  normalizeDday,
  z.object({
    recordId: z.number(),
    recordedAt: z.string(),
    photoUrls: z.array(z.string()).nullish(),
    statusDescription: z.string().nullish(),
    redness: Intensity,
    swelling: Intensity,
    pain: Intensity,
    dryness: Intensity,
    aiFeedback: AiFeedback.nullable(),
    dday: z.number(),
  }),
);
export type RecordTimelineItem = z.infer<typeof RecordTimelineItem>;

export const RecordTimelineResponse = z.object({
  cardId: z.number(),
  careRecords: z.array(RecordTimelineItem),
});
export type RecordTimelineResponse = z.infer<typeof RecordTimelineResponse>;

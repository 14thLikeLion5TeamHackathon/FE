import { z } from 'zod';

/* ── 공통 ─────────────────────────────────────────────────── */

export const CardStatus = z.enum(['IN_PROGRESS', 'DONE']);
export type CardStatus = z.infer<typeof CardStatus>;

export const AiFeedback = z.object({
  feedbackId: z.number(),
  changeSummary: z.string(),
  careGuidance: z.string(),
  needsConsultation: z.boolean(),
});
export type AiFeedback = z.infer<typeof AiFeedback>;

/* ── GET /api/v1/cards — 케어카드 목록 조회 (카드별 최근 기록 포함) ── */

export const CareCard = z.object({
  cardId: z.number(),
  treatmentName: z.string(),
  treatmentDate: z.string(), // "2026-08-15"
  status: CardStatus,
  recoveryTotalDays: z.number(),
  recordId: z.number().nullable().optional(),
  recordedAt: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  statusDescription: z.string().nullable().optional(),
  redness: z.number().nullable().optional(),
  swelling: z.number().nullable().optional(),
  pain: z.number().nullable().optional(),
  dryness: z.number().nullable().optional(),
  aiFeedback: AiFeedback.nullable().optional(),
  dday: z.number(),
});
export type CareCard = z.infer<typeof CareCard>;

/* ── GET /api/v1/cards/{cardId} — 케어카드 상세 조회 ─────── */

export const FeedbackQuota = z.object({
  used: z.number(),
  total: z.number(),
});
export type FeedbackQuota = z.infer<typeof FeedbackQuota>;

export const VisitedStore = z.object({
  storeId: z.number(),
  name: z.string(),
  address: z.string(),
  url: z.string(),
  latitude: z.string(),
  longitude: z.string(),
});
export type VisitedStore = z.infer<typeof VisitedStore>;

export const CardDetail = z.object({
  cardId: z.number(),
  treatmentName: z.string(),
  treatmentDate: z.string(),
  recoveryTotalDays: z.number(),
  recoveryTransitionDay: z.number(),
  todayCare: z.array(z.string()),
  feedbackQuota: FeedbackQuota,
  visitedStore: VisitedStore.nullable(),
  dday: z.number(),
});
export type CardDetail = z.infer<typeof CardDetail>;

/* ── GET /api/v1/cards/{cardId}/records — 카드별 이전 기록 ─ */

export const CareRecord = z.object({
  recordId: z.number(),
  recordedAt: z.string(),
  photoUrl: z.string().nullable(),
  statusDescription: z.string(),
  redness: z.number(),
  swelling: z.number(),
  pain: z.number(),
  dryness: z.number(),
  aiFeedback: AiFeedback.nullable(),
  dday: z.number(),
});
export type CareRecord = z.infer<typeof CareRecord>;

export const CardRecords = z.object({
  cardId: z.number(),
  careRecords: z.array(CareRecord),
});
export type CardRecords = z.infer<typeof CardRecords>;

/* ── 카드 생성 ───────────────────────────────────────────── */

export const TreatmentCategory = z.enum(['DRUG', 'DEVICE', 'FNB', 'ETC']);
export type TreatmentCategory = z.infer<typeof TreatmentCategory>;

export const CATEGORY_LABEL: Record<TreatmentCategory, string> = {
  DRUG: '약물·주사',
  DEVICE: '기기 기반',
  FNB: 'F&B·제품',
  ETC: '기타 관리',
};

export const Treatment = z.object({
  treatmentId: z.number(),
  name: z.string(),
  description: z.string(),
  category: TreatmentCategory,
  thumbnailUrl: z.string().nullable(),
});
export type Treatment = z.infer<typeof Treatment>;

/** TreatmentEntry — 카드 생성 시 선택한 시술 항목 */
export const TreatmentEntry = z.object({
  treatmentId: z.number(),
  customName: z.string().nullable(),
});
export type TreatmentEntry = z.infer<typeof TreatmentEntry>;

export const CreateCardRequest = z.object({
  treatmentDate: z.string(),
  treatments: z.array(TreatmentEntry).min(1),
});
export type CreateCardRequest = z.infer<typeof CreateCardRequest>;

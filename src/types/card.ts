import { z } from 'zod';

/**
 * 케어 카드 = 회복 여정. 기록은 카드 안에 산다.
 * BE 계약이 아직 없어 시안에서 역산한 임시 스키마다.
 */

export const CardStatus = z.enum(['IN_PROGRESS', 'DONE']);
export type CardStatus = z.infer<typeof CardStatus>;

/** 목록·카드 상세 상단에 공통으로 쓰는 요약 */
export const CareCard = z.object({
  id: z.string(),
  /** 시술명 (예: 포텐자) */
  name: z.string(),
  /** YYYY.MM.DD */
  treatedAt: z.string(),
  /** 시술일로부터 지난 일수. 화면에는 `D+7`로 표기 */
  dday: z.number().int(),
  /** 회복 총 기간(일). 시안 기준 29 */
  totalDays: z.number().int(),
  status: CardStatus,
  /** 오늘의 관리 — 「오늘의 관리 행동 (공통)」 산출 결과 */
  todayCare: z.string(),
  /** 오늘이 기록 권장일인지. 맞으면 기록 버튼을 주요 버튼으로 승격한다 */
  recordRecommended: z.boolean(),
});
export type CareCard = z.infer<typeof CareCard>;

/** 회복 가이드 한 구간 */
export const RecoveryGuideStep = z.object({
  /** 예: "D+1~3" */
  range: z.string(),
  description: z.string(),
  /** 현재 구간이면 강조한다 */
  current: z.boolean(),
});
export type RecoveryGuideStep = z.infer<typeof RecoveryGuideStep>;

export const CardDetail = CareCard.extend({
  guide: z.array(RecoveryGuideStep),
  cautions: z.array(z.string()),
  /** D+21~29에만 노출. 그 밖에는 null */
  storeVisit: z
    .object({
      title: z.string(),
      description: z.string(),
    })
    .nullable(),
});
export type CardDetail = z.infer<typeof CardDetail>;

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
  id: z.string(),
  name: z.string(),
  /** 목록에서 이름 아래 보여주는 한 줄 설명 */
  description: z.string(),
  category: TreatmentCategory,
  thumbnailUrl: z.string().nullable(),
});
export type Treatment = z.infer<typeof Treatment>;

export const CreateCardRequest = z.object({
  treatmentIds: z.array(z.string()).min(1),
  /** YYYY.MM.DD */
  treatedAt: z.string(),
  /** 시술명을 정확히 모를 때 */
  unknownTreatment: z.boolean(),
});
export type CreateCardRequest = z.infer<typeof CreateCardRequest>;

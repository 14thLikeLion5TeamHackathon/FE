import { z } from 'zod';

import { daysSince } from '../lib/date';

/* ── 공통 ─────────────────────────────────────────────────── */

/**
 * D-day를 `dday`로 맞춘다.
 *
 * 실서버는 **`dDay`**(대문자 D)로 주고, 그마저도 `null`인 경우가 있다. 스웨거에는 `dday`로
 * 적혀 있어 문서와 실제가 어긋난다. 이름이 안 맞으면 필수 필드가 비어 `.parse()`가 통째로
 * 실패하고, 카드 목록이 영영 안 뜬다 — 회복 탭이 실제로 그렇게 죽어 있었다.
 *
 * 값이 아예 없으면 시술일로부터 계산한다. 서버 브리핑의 셈법과 같다(시술일 당일이 0).
 * 화면 여러 곳이 `dday`를 숫자로 쓰기 때문에 여기서 숫자로 확정해 내보낸다.
 */
function normalizeDday(raw: unknown) {
  if (typeof raw !== 'object' || raw === null) return raw;

  const card = raw as Record<string, unknown>;
  const given = card.dday ?? card.dDay;
  if (typeof given === 'number') return { ...card, dday: given };

  const computed = typeof card.treatmentDate === 'string' ? daysSince(card.treatmentDate) : null;
  return { ...card, dday: computed ?? 0 };
}

/**
 * 카드 진행 상태.
 *
 * 스웨거에는 그냥 `string`으로 적혀 있어 서버가 다른 값을 보낼 여지가 있다.
 * 열거형으로 못 박아 두면 모르는 값 하나에 `.parse()`가 통째로 터지고 **카드 목록 전체가
 * 빈 화면**이 된다 — 기록 등록 `tags`에서 실제로 겪은 사고다.
 *
 * 그래서 모르는 값은 `IN_PROGRESS`로 떨어뜨린다. 완료로 떨어뜨리면 사용자의 카드가
 * 회복 탭에서 조용히 사라지는데, 그보다는 진행 중 목록에 남아 눈에 띄는 편이 낫다.
 *
 * ⚠️ 실서버는 실제로 **`active`**를 보낸다(확인함). 지금은 폴백 덕에 진행 중으로 잡히지만,
 * **완료 상태의 값을 아직 못 봤다.** 그 값도 폴백에 걸리면 완료 카드가 진행 중으로 보인다.
 * BE에 상태 값 목록을 확인해서 여기 열거형을 실제 값으로 바꿔야 한다.
 */
export const CardStatus = z.enum(['IN_PROGRESS', 'DONE']).catch('IN_PROGRESS');
export type CardStatus = z.infer<typeof CardStatus>;

export const AiFeedback = z.object({
  feedbackId: z.number(),
  changeSummary: z.string(),
  careGuidance: z.string(),
  needsConsultation: z.boolean(),
});
export type AiFeedback = z.infer<typeof AiFeedback>;

/* ── GET /api/v1/cards — 케어카드 목록 조회 (카드별 최근 기록 포함) ── */

export const CareCard = z.preprocess(
  normalizeDday,
  z.object({
    cardId: z.number(),
    treatmentName: z.string(),
    treatmentDate: z.string(), // "2026-08-15"
    status: CardStatus,
    recoveryTotalDays: z.number(),
    recordId: z.number().nullable().optional(),
    recordedAt: z.string().nullable().optional(),
    // 스웨거는 `photoUrls: string[]`다. 한 기록에 사진이 여러 장 붙는다 —
    // 단수 `photoUrl`로 두면 실서버 응답에서 값이 통째로 사라진다.
    photoUrls: z.array(z.string()).nullish(),
    statusDescription: z.string().nullable().optional(),
    redness: z.number().nullable().optional(),
    swelling: z.number().nullable().optional(),
    pain: z.number().nullable().optional(),
    dryness: z.number().nullable().optional(),
    aiFeedback: AiFeedback.nullable().optional(),
    dday: z.number(),
  }),
);
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

export const CardDetail = z.preprocess(
  normalizeDday,
  z.object({
    cardId: z.number(),
    treatmentName: z.string(),
    treatmentDate: z.string(),
    recoveryTotalDays: z.number(),
    recoveryTransitionDay: z.number(),
    todayCare: z.array(z.string()),
    feedbackQuota: FeedbackQuota,
    visitedStore: VisitedStore.nullable(),
    dday: z.number(),
  }),
);
export type CardDetail = z.infer<typeof CardDetail>;

/* ── GET /api/v1/cards/{cardId}/records — 카드별 이전 기록 ─
 * 타임라인 항목은 기록 도메인이 소유한다 — 등록 응답과 형태가 달라 한 파일에서
 * 나란히 봐야 헷갈리지 않는다. `types/record.ts`의 RecordTimeline* 참고. */

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

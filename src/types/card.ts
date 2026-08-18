import { z } from 'zod';

import { normalizeDday } from './common';

/* ── 공통 ─────────────────────────────────────────────────── */

/**
 * 카드 진행 상태.
 *
 * 서버는 소문자 `active` / `completed`를 보낸다(실응답·BE 문서로 확인). 스웨거에는 그냥
 * `string`이라 값 목록이 없다. 화면에서는 계속 `IN_PROGRESS` / `DONE`을 쓰고, **경계에서만
 * 바꾼다** — 서버가 이름을 또 바꿔도 고칠 곳이 이 표 하나다.
 *
 * 모르는 값은 `IN_PROGRESS`로 떨어뜨린다. 완료로 떨어뜨리면 사용자의 카드가 회복 탭에서
 * 조용히 사라지는데, 그보다는 진행 중 목록에 남아 눈에 띄는 편이 낫다. 열거형으로 못 박고
 * 폴백이 없으면 모르는 값 하나에 `.parse()`가 터져 **카드 목록 전체가 빈 화면**이 된다.
 */
const SERVER_STATUS: Record<string, 'IN_PROGRESS' | 'DONE'> = {
  active: 'IN_PROGRESS',
  completed: 'DONE',
};

export const CardStatus = z
  .preprocess(
    (raw) => (typeof raw === 'string' ? (SERVER_STATUS[raw] ?? raw) : raw),
    z.enum(['IN_PROGRESS', 'DONE']),
  )
  .catch('IN_PROGRESS');
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
    /**
     * 목록에 딸려오는 **최근 기록**의 경과일이다 — 카드의 현재 경과일이 아니다.
     * 위의 recordId·recordedAt·photoUrls와 한 덩어리라, 기록이 하나도 없는 카드에서는
     * 함께 비어 올 수 있다. 필수로 두면 그런 카드 하나에 회복 탭 전체가 빈 화면이 된다.
     * 화면에 쓸 경과일은 treatmentDate로 계산한다(recovery/components/CareCard.tsx 참고).
     */
    dday: z.number().nullable().optional(),
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

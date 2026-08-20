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

/**
 * 카드에 딸려오는 AI 피드백 요약.
 *
 * 스웨거(`AiFeedbackItem`)에 required가 하나도 없다. 이 스키마는 **카드 목록과 기록
 * 타임라인 양쪽에 중첩**돼 있어서, 필드 하나가 비는 순간 회복 탭과 카드 상세가 통째로
 * 빈 화면이 된다. 화면이 실제로 읽는 건 `changeSummary` 한 줄뿐이고 그마저 없으면
 * 그 줄만 감추면 되므로, 전부 선택으로 둔다.
 */
export const AiFeedback = z.object({
  feedbackId: z.number().nullish(),
  changeSummary: z.string().nullish(),
  careGuidance: z.string().nullish(),
  needsConsultation: z.boolean().nullish(),
});
export type AiFeedback = z.infer<typeof AiFeedback>;

/**
 * 시술명이 비어 왔을 때 화면에 세우는 이름.
 *
 * 이름은 스웨거에서 선택이라 언제든 빠질 수 있는데, 카드 자체는 여전히 열고 기록할 수 있다.
 * 빈 칸을 두면 사용자가 카드가 깨진 줄 알기 때문에 자리를 채워 둔다.
 */
export const NO_TREATMENT_NAME = '이름 없는 케어';

/* ── GET /api/v1/cards — 케어카드 목록 조회 (카드별 최근 기록 포함) ── */

export const CareCard = z.preprocess(
  normalizeDday,
  z.object({
    /**
     * 카드 키. **여기만 필수로 남긴다** — 상세 이동·기록 등록·목록 key가 전부 이 값이라
     * 없으면 그 카드로 할 수 있는 일이 하나도 없다. 걸러내는 편이 맞다.
     */
    cardId: z.number(),
    /**
     * 아래 셋은 스웨거에 required가 없다(응답 DTO 전체가 그렇다).
     * 카드 한 장의 이름이 비었다고 목록 전체가 빈 화면이 되면 안 된다 — 화면에서 폴백한다.
     * 시술일은 화면이 경과일을 계산하는 값이라, 없으면 서버가 준 dday로 물러난다.
     */
    treatmentName: z.string().nullish(),
    treatmentDate: z.string().nullish(), // "2026-08-15"
    status: CardStatus,
    recoveryTotalDays: z.number().nullish(),
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

/** 하루 AI 분석 횟수. 스웨거에 required가 없어 둘 다 선택 — 화면이 0/3으로 물러난다 */
export const FeedbackQuota = z.object({
  used: z.number().nullish(),
  total: z.number().nullish(),
});
export type FeedbackQuota = z.infer<typeof FeedbackQuota>;

/**
 * 방문한 제휴 매장. 카드 상세 안에 중첩돼 있어 한 필드만 비어도 **상세 화면이 통째로 죽는다**.
 * 재방문 유도 블록 하나 때문에 화면 전체를 잃을 이유가 없으므로 전부 선택으로 둔다.
 * 이름이 없으면 블록 자체를 감춘다(CardDetailPage 참고).
 */
export const VisitedStore = z.object({
  storeId: z.number().nullish(),
  name: z.string().nullish(),
  address: z.string().nullish(),
  url: z.string().nullish(),
  latitude: z.string().nullish(),
  longitude: z.string().nullish(),
});
export type VisitedStore = z.infer<typeof VisitedStore>;

export const CardDetail = z.preprocess(
  normalizeDday,
  z.object({
    /** 목록과 같은 이유로 카드 키만 필수다 — 이 값이 없으면 상세 화면이 성립하지 않는다 */
    cardId: z.number(),
    /**
     * 나머지는 전부 선택이다. 스웨거 응답 DTO에 required가 하나도 없는데 여기를 필수로
     * 잡아 두면 **카드 상세가 통째로 빈 화면**이 된다. 회복 가이드·주의사항은 이미
     * 회복일 수가 0이면 빈 목록을 내도록 돼 있어서(CardDetailPage), 폴백으로 충분하다.
     */
    treatmentName: z.string().nullish(),
    treatmentDate: z.string().nullish(),
    recoveryTotalDays: z.number().nullish(),
    recoveryTransitionDay: z.number().nullish(),
    todayCare: z.array(z.string()).nullish(),
    feedbackQuota: FeedbackQuota.nullish(),
    visitedStore: VisitedStore.nullish(),
    /** 위의 normalizeDday가 항상 숫자로 만들어 내보내므로 여기만 필수로 둔다 */
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

/**
 * 서버가 쓰는 카테고리 표기 → 화면이 쓰는 코드.
 *
 * 서버는 `category`를 **한글 라벨**로 준다("약물·주사"). 코드(`DRUG`)로 주지 않는다 —
 * 실서버 386건을 전부 확인했다. 조회 파라미터도 마찬가지라 `category=DRUG`로 물으면 0건,
 * `category=약물·주사`로 물어야 265건이 온다.
 *
 * `CardStatus`와 같은 방식으로 **경계에서만 바꾼다.** 화면은 계속 코드를 쓰고,
 * 서버 표기가 또 바뀌어도 고칠 곳은 이 표 하나다.
 */
const CATEGORY_FROM_SERVER: Record<string, TreatmentCategory> = Object.fromEntries(
  (Object.keys(CATEGORY_LABEL) as TreatmentCategory[]).map((code) => [CATEGORY_LABEL[code], code]),
);

/** 화면 코드 → 서버 표기. 목록을 좁힐 때 이 값으로 물어야 한다 */
export function toServerCategory(category: TreatmentCategory): string {
  return CATEGORY_LABEL[category];
}

export const Treatment = z.object({
  /** 카드 생성 요청에 실어 보내는 키. 없으면 고를 수가 없으니 필수로 남긴다 */
  treatmentId: z.number(),
  name: z.string().nullish(),
  /**
   * 서버는 코드가 아니라 한글 라벨을 준다. 모르는 값은 `ETC`로 떨어뜨린다 —
   * 열거형으로 못 박으면 값 하나에 `.parse()`가 터져 **시술 목록 전체가 빈 화면**이 된다.
   */
  category: z
    .preprocess(
      (raw) => (typeof raw === 'string' ? (CATEGORY_FROM_SERVER[raw] ?? raw) : raw),
      TreatmentCategory,
    )
    .catch('ETC'),
  /**
   * 목록에서 이름 아래 보여주는 한 줄 설명.
   *
   * `category`를 `.catch()`로 막아 둔 것과 **같은 이유가 아래 셋에도 그대로 적용된다** —
   * 스웨거에 required가 없어서, 386건 중 설명이 빈 시술 하나만 있어도 필수로 잡아 두면
   * 시술 목록 전체가 빈 화면이 된다.
   */
  description: z.string().nullish(),
  storeName: z.string().nullish(),
  storeLocation: z.string().nullish(),
});
export type Treatment = z.infer<typeof Treatment>;

/**
 * 시술 목록 응답 — 페이지 한 장.
 *
 * 서버가 배열에서 페이지 객체로 바꿨다(`page` 기본 0, `size` 기본 6).
 * 예전 `z.array(Treatment)`로 그대로 받으면 `.parse()`가 터져 **시술 목록이 통째로 빈 화면**이 된다.
 *
 * `content`만 실질적으로 쓰고 나머지는 다음 장이 있는지 판단하는 데만 본다.
 * 스웨거에 required가 없어 전부 선택으로 둔다 — 페이지 메타 하나가 비었다고
 * 이미 받아온 시술 목록을 버릴 이유가 없다.
 */
export const TreatmentPage = z.object({
  content: z.array(Treatment).nullish(),
  page: z.number().nullish(),
  size: z.number().nullish(),
  totalElements: z.number().nullish(),
  totalPages: z.number().nullish(),
  hasNext: z.boolean().nullish(),
});
export type TreatmentPage = z.infer<typeof TreatmentPage>;

export const CreateCardTreatment = z.object({
  treatmentId: z.number(),
  /** 시술명을 정확히 모를 때 직접 적는 이름. 지금 화면에서는 보내지 않는다(이슈 #68) */
  customName: z.string().nullable().optional(),
});
export type CreateCardTreatment = z.infer<typeof CreateCardTreatment>;

export const CreateCardRequest = z.object({
  /** YYYY-MM-DD */
  treatmentDate: z.string(),
  treatments: z.array(CreateCardTreatment).min(1),
});
export type CreateCardRequest = z.infer<typeof CreateCardRequest>;

/**
 * 카드 생성 응답.
 *
 * 성공 직후 화면 전환 자리라 `CreateRecordResponse`와 사정이 같다 — 여기서 `.parse()`가
 * 터지면 **카드는 이미 만들어졌는데** 화면은 실패로 보이고, 사용자가 다시 눌러 같은 카드를
 * 두 번 만든다. 스웨거에 required가 없으므로 전부 선택으로 둔다.
 * `cardId`가 비면 상세로 못 가지만, 그때는 회복 탭으로 보내면 새 카드가 목록에 보인다.
 */
export const CreateCardResponse = z.object({
  cardId: z.number().nullish(),
  /** YYYY-MM-DD */
  treatmentDate: z.string().nullish(),
  createdAt: z.string().nullish(),
});
export type CreateCardResponse = z.infer<typeof CreateCardResponse>;

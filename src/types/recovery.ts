import type { SymptomKey } from './common';

/**
 * 회복 탭 **화면용** 타입.
 *
 * 서버에는 회복 탭 모양의 엔드포인트가 없다. `GET /api/v1/cards`(카드 목록 + 카드별 최근 기록)와
 * `GET /api/v1/cards/{cardId}/records`(회복 타임라인) 두 응답을 프론트에서 조립해 만든다.
 *
 * 그래서 이 파일에는 Zod 스키마가 없다 — 여기 오는 값은 이미 `types/card.ts`의 스키마가
 * `.parse()`로 검증한 뒤다. 한 번 더 감싸면 검증이 두 벌이 되고, 서버 계약이 바뀌었을 때
 * 어느 쪽을 고쳐야 하는지가 흐려진다. API 계약의 단일 소스는 계속 `types/card.ts`다.
 */

/** 회복 곡선의 한 시점. `CareRecord` 하나에서 만든다. */
export type RecoveryPoint = {
  recordId: number;
  /** "D+7" */
  ddayLabel: string;
  /** "08.01" */
  dateLabel: string;
  /** 기록에 사진이 여러 장 붙어도 곡선은 대표 1장만 쓴다 — 두 시점 비교가 목적이라 장수는 의미가 없다 */
  photoUrl: string | null;
  /** 증상 4종 강도. 곡선의 y값 */
  symptoms: { key: SymptomKey; intensity: number }[];
};

/**
 * 회복 곡선 하나. 시안이 곡선을 하나만 전제하므로 카드 한 장에 묶인다.
 * `points`는 기록 수만큼 늘어난다 — x축을 3점으로 고정하지 않는다.
 * 기록이 1개 이하면 곡선을 그리지 않고 기록을 유도한다(추세는 점 두 개부터 생긴다).
 */
export type RecoveryCurve = {
  cardId: number;
  treatmentName: string;
  points: RecoveryPoint[];
};

/** 곡선을 어느 카드로 볼지 고르는 선택지. 진행 중 카드가 2장 이상일 때만 쓰인다. */
export type RecoveryCardOption = {
  cardId: number;
  treatmentName: string;
};

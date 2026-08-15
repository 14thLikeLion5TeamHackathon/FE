import { z } from 'zod';

import { CareCard } from './card';
import { Intensity, SymptomKey } from './common';

/**
 * 회복 탭 — 카드 목록 + 회복 곡선.
 * 사진이 실감을, 곡선이 추세를 담당한다.
 */

/** 회복 곡선의 한 시점 */
export const RecoveryPoint = z.object({
  recordId: z.string(),
  /** "D+7" */
  ddayLabel: z.string(),
  /** "08.01" */
  dateLabel: z.string(),
  photoUrl: z.string().nullable(),
  /** 증상 4종 강도. 곡선의 y값 */
  symptoms: z.array(z.object({ key: SymptomKey, intensity: Intensity })),
});
export type RecoveryPoint = z.infer<typeof RecoveryPoint>;

/**
 * 사진이 1장 이하면 곡선 대신 기록 유도 안내를 띄운다.
 * `points`는 기록 수만큼 늘어난다 — x축을 3점으로 고정하지 않는다.
 */
export const RecoveryCurve = z.object({
  cardId: z.number(),
  points: z.array(RecoveryPoint),
  /** 비교할 두 시점의 인덱스. 기본은 [처음, 마지막] */
  comparedIndexes: z.tuple([z.number().int(), z.number().int()]),
});
export type RecoveryCurve = z.infer<typeof RecoveryCurve>;

export const RecoveryResponse = z.object({
  inProgress: z.array(CareCard),
  done: z.array(CareCard),
  /** 카드가 없거나 기록이 1개 이하면 null */
  curve: RecoveryCurve.nullable(),
});
export type RecoveryResponse = z.infer<typeof RecoveryResponse>;

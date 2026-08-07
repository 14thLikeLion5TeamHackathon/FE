import { z } from 'zod';

import { EvidenceChip, Intensity, SymptomKey, Trend } from './common';

/**
 * AI 피드백 — 기록 직후 생성되는 결과 화면.
 *
 * 비교는 항상 `직전 기록 → 방금 기록` 1:1이다.
 * 미래 데이터가 없으므로 전체 흐름은 회복 탭이 담당한다.
 */

/** 증상 한 줄. 화면에서는 색 + `↓ ↑ –` 기호로 이중 부호화한다 */
export const SymptomDelta = z.object({
  key: SymptomKey,
  before: Intensity,
  after: Intensity,
  trend: Trend,
});
export type SymptomDelta = z.infer<typeof SymptomDelta>;

export const ComparisonSide = z.object({
  /** "D+3" */
  ddayLabel: z.string(),
  photoUrl: z.string().nullable(),
});
export type ComparisonSide = z.infer<typeof ComparisonSide>;

/**
 * 문의 권고. **AI 판단이 아니라 규칙으로 뜬다.**
 * 판정 기준: 붓기·통증 강도 3이 2일 이상 지속 / 고름·발열 언급 /
 * D+3 이후 통증이 이전 기록보다 상승
 */
export const MedicalAdvice = z.object({
  /** 규칙에 걸렸는지 */
  required: z.boolean(),
  message: z.string(),
  /** 어떤 규칙에 걸렸는지 화면에 노출한다 */
  criteria: z.string().nullable(),
});
export type MedicalAdvice = z.infer<typeof MedicalAdvice>;

export const AiFeedback = z.object({
  id: z.string(),
  cardId: z.string(),
  cardName: z.string(),
  /** "D+7 · 오늘 기록" */
  contextLabel: z.string(),
  before: ComparisonSide,
  after: ComparisonSide,
  deltas: z.array(SymptomDelta),
  /** 사용자가 적은 메모를 인용 */
  quotedMemo: z.string().nullable(),
  /** 분석 문구 */
  analysis: z.string(),
  evidence: z.array(EvidenceChip),
  /** 기록 강도 검토 — 사용자 입력을 사진과 대조한 코멘트. 점수를 덮어쓰지는 않는다 */
  intensityReview: z.string().nullable(),
  /** 「오늘의 관리 행동 (공통)」 산출 결과 */
  todayCare: z.array(z.string()),
  advice: MedicalAdvice,
});
export type AiFeedback = z.infer<typeof AiFeedback>;

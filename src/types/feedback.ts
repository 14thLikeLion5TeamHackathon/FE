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

/**
 * 화면(FeedbackPage)이 기대하는 뷰모델 형태.
 * 실 API 응답(FeedbackResponse)과 필드 구조가 달라, useFeedback 훅에서 매핑해 만든다.
 */
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

/* ── 실 API 응답 (GET/POST /api/v1/now/records/{recordId}/feedback) ────── */

export const FeedbackSymptomComparison = z.object({
  /** SymptomKey와 같은 값이어야 한다 (예: "SWELLING") */
  type: z.string(),
  name: z.string(),
  /** Trend와 같은 값이어야 한다 (예: "DOWN") */
  trend: z.string(),
  previousLabel: z.string(),
  currentLabel: z.string(),
});
export type FeedbackSymptomComparison = z.infer<typeof FeedbackSymptomComparison>;

export const FeedbackComparison = z.object({
  previousRecordId: z.number(),
  previousDDay: z.number(),
  previousPhotoUrl: z.string().nullable(),
  currentPhotoUrl: z.string().nullable(),
  symptoms: z.array(FeedbackSymptomComparison),
  userComment: z.string().nullable(),
});
export type FeedbackComparison = z.infer<typeof FeedbackComparison>;

export const FeedbackAnalysisTags = z.object({
  treatmentDay: z.string(),
  checklistRate: z.number(),
  photoCount: z.number(),
});
export type FeedbackAnalysisTags = z.infer<typeof FeedbackAnalysisTags>;

export const FeedbackResponse = z.object({
  feedbackId: z.number(),
  recordId: z.number(),
  cardId: z.number(),
  /** 카드 이름 필드가 API에 없어 화면에서는 이 값을 대신 쓴다 */
  treatmentName: z.string(),
  comparison: FeedbackComparison,
  analysisSummary: z.string(),
  analysisTags: FeedbackAnalysisTags,
  intensityReview: z.string().nullable(),
  todayCare: z.array(z.string()),
  needsConsultation: z.boolean(),
  consultationMessage: z.string().nullable(),
  consultationCriteria: z.string().nullable(),
  createdAt: z.string(),
  dday: z.number(),
});
export type FeedbackResponse = z.infer<typeof FeedbackResponse>;

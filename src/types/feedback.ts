import { z } from 'zod';

import { EvidenceChip, INTENSITY_LABEL, Intensity, SymptomKey, Trend } from './common';

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

/* ── 서버 응답 → 화면 모양 변환 ─────────────────────────────
 *
 * 서버는 자기 모양으로 주고(`AiFeedbackResponse`), 화면은 시안 모양(`AiFeedback`)을 쓴다.
 * 둘을 여기서 잇는다 — 화면이 서버 필드명을 몰라도 되게 하려는 것이다.
 * 아래 값들은 **실응답으로 확인한 것**이다(2026-08-16, recordId 3·4).
 */

/** 서버가 주는 증상 키(소문자) → 우리 키 */
const SYMPTOM_BY_TYPE: Record<string, SymptomKey> = {
  redness: 'REDNESS',
  swelling: 'SWELLING',
  pain: 'PAIN',
  dryness: 'DRYNESS',
};

/**
 * 서버가 주는 추세.
 *
 * ⚠️ 실제로 확인한 값은 `same` 하나뿐이다 — 증상이 변한 기록이 없었다.
 * 나머지는 흔한 표기를 넓게 받아 두고, 모르면 `SAME`으로 떨어뜨린다.
 * 방향을 틀리게 보여주느니 "변화 없음"이 안전하다.
 */
const TREND_BY_NAME: Record<string, Trend> = {
  same: 'SAME',
  up: 'UP',
  increase: 'UP',
  increased: 'UP',
  worse: 'UP',
  down: 'DOWN',
  decrease: 'DOWN',
  decreased: 'DOWN',
  better: 'DOWN',
};

/** "없음"·"약간"·"보통"·"심함" → 0~3. 모르는 라벨은 null이라 호출부가 버린다 */
function toIntensity(label: string | null | undefined): number | null {
  if (!label) return null;
  const index = INTENSITY_LABEL.indexOf(label as (typeof INTENSITY_LABEL)[number]);
  return index === -1 ? null : index;
}

export const SymptomTrend = z.object({
  type: z.string(),
  name: z.string().nullish(),
  trend: z.string().nullish(),
  previousLabel: z.string().nullish(),
  currentLabel: z.string().nullish(),
});

export const ComparisonInfo = z.object({
  previousRecordId: z.number().nullish(),
  previousDDay: z.number().nullish(),
  previousPhotoUrl: z.string().nullish(),
  currentPhotoUrl: z.string().nullish(),
  symptoms: z.array(SymptomTrend).nullish(),
  userComment: z.string().nullish(),
});

export const AnalysisTags = z.object({
  treatmentDay: z.string().nullish(),
  checklistRate: z.number().nullish(),
  photoCount: z.number().nullish(),
});

/** 서버 응답 그대로. D-day는 카드와 마찬가지로 `dDay`(대문자 D)로 온다 */
export const AiFeedbackResponse = z.object({
  feedbackId: z.number(),
  recordId: z.number().nullish(),
  cardId: z.number(),
  treatmentName: z.string().nullish(),
  dDay: z.number().nullish(),
  comparison: ComparisonInfo.nullish(),
  analysisSummary: z.string().nullish(),
  analysisTags: AnalysisTags.nullish(),
  intensityReview: z.string().nullish(),
  todayCare: z.array(z.string()).nullish(),
  needsConsultation: z.boolean().nullish(),
  consultationMessage: z.string().nullish(),
  consultationCriteria: z.string().nullish(),
});
export type AiFeedbackResponse = z.infer<typeof AiFeedbackResponse>;

/**
 * 판단 근거 칩.
 *
 * `checklistRate`는 **비율(0~1)** 이다 — 체크리스트를 1/3 체크한 상태에서 `0.17`이 왔다.
 * 퍼센트였다면 "0.17%"라는 말이 안 되는 값이 된다.
 *
 * ⚠️ 다만 **분모가 오늘 체크리스트가 아니다.** 1/3이면 `0.33`이어야 하는데 `0.17`(≒1/6)이
 * 왔다. 카드 기간에 쌓인 전체를 세는 것으로 보이지만 확인된 건 아니라, 화면에는 서버 값을
 * 그대로 퍼센트로만 바꿔 보여준다.
 *
 * `photoCount`도 이 기록의 사진 수가 아니라 **누적**이다(첫 기록 4 → 두 번째 8, 각 기록은
 * 4장씩). 기록 하나 옆에 "사진 8장"이라고 두면 오해하기 좋아서 '누적'을 붙였다.
 */
function toEvidence(tags: AiFeedbackResponse['analysisTags']): { label: string }[] {
  if (!tags) return [];

  const chips: { label: string }[] = [];
  if (tags.treatmentDay) chips.push({ label: tags.treatmentDay });
  if (typeof tags.checklistRate === 'number') {
    chips.push({ label: `체크리스트 ${Math.round(tags.checklistRate * 100)}%` });
  }
  if (tags.photoCount) chips.push({ label: `사진 ${tags.photoCount}장 누적` });
  return chips;
}

/** 서버 응답을 화면이 쓰는 모양으로 바꾼다 */
export function toAiFeedback(raw: AiFeedbackResponse): AiFeedback {
  const comparison = raw.comparison;
  const dday = raw.dDay;

  const deltas = (comparison?.symptoms ?? []).flatMap((symptom) => {
    const key = SYMPTOM_BY_TYPE[symptom.type];
    const before = toIntensity(symptom.previousLabel);
    const after = toIntensity(symptom.currentLabel);
    // 하나라도 못 읽으면 그 줄만 버린다 — 비교 한 줄 때문에 화면 전체를 막지 않는다
    if (!key || before === null || after === null) return [];

    return [
      {
        key,
        before,
        after,
        trend: TREND_BY_NAME[(symptom.trend ?? '').toLowerCase()] ?? 'SAME',
      },
    ];
  });

  return {
    id: String(raw.feedbackId),
    cardId: String(raw.cardId),
    cardName: raw.treatmentName ?? '',
    contextLabel: dday === null || dday === undefined ? '오늘 기록' : `D+${dday} · 오늘 기록`,
    before: {
      // 첫 기록이면 비교 대상이 없다 — 서버가 previous를 전부 null로 준다
      ddayLabel:
        comparison?.previousDDay === null || comparison?.previousDDay === undefined
          ? '이전 기록 없음'
          : `D+${comparison.previousDDay}`,
      photoUrl: comparison?.previousPhotoUrl ?? null,
    },
    after: {
      ddayLabel: dday === null || dday === undefined ? '오늘' : `D+${dday} · 오늘`,
      photoUrl: comparison?.currentPhotoUrl ?? null,
    },
    deltas,
    quotedMemo: comparison?.userComment ?? null,
    analysis: raw.analysisSummary ?? '',
    evidence: toEvidence(raw.analysisTags),
    intensityReview: raw.intensityReview ?? null,
    todayCare: raw.todayCare ?? [],
    advice: {
      required: raw.needsConsultation ?? false,
      message: raw.consultationMessage ?? '',
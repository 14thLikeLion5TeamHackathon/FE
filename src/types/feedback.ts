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
 * ⚠️ `checklistRate`의 단위를 확정하지 못했다 — 확인한 값이 `0.0` 하나라 비율(0~1)인지
 * 퍼센트(0~100)인지 구분이 안 된다. 1을 넘으면 이미 퍼센트로 보고, 아니면 비율로 친다.
 * 100%가 `1.0`으로 오면 "1%"로 보이는 게 이 어림짐작의 실패 모습이다.
 */
function toEvidence(tags: AiFeedbackResponse['analysisTags']): { label: string }[] {
  if (!tags) return [];

  const chips: { label: string }[] = [];
  if (tags.treatmentDay) chips.push({ label: tags.treatmentDay });
  if (typeof tags.checklistRate === 'number') {
    const percent = tags.checklistRate > 1 ? tags.checklistRate : tags.checklistRate * 100;
    chips.push({ label: `체크리스트 ${Math.round(percent)}%` });
  }
  if (tags.photoCount) chips.push({ label: `사진 ${tags.photoCount}장` });
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
      criteria: raw.consultationCriteria ?? null,
    },
  };
}

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

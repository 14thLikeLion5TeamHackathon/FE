import { useQuery } from '@tanstack/react-query';

import { getFeedback } from '../../api/feedback';
import { INTENSITY_LABEL, SymptomKey, Trend } from '../../types/common';
import type { AiFeedback, FeedbackResponse, FeedbackSymptomComparison, SymptomDelta } from '../../types/feedback';

/**
 * "없음/약간/보통/심함" 라벨 문자열을 INTENSITY_LABEL 인덱스로 되돌린다.
 * 실 API가 강도를 숫자가 아니라 라벨 문자열로만 주기 때문에 필요하다.
 * 라벨이 INTENSITY_LABEL과 정확히 일치하지 않으면 0("없음")으로 떨어진다.
 */
function labelToIntensity(label: string): number {
  const index = (INTENSITY_LABEL as readonly string[]).indexOf(label);
  return index === -1 ? 0 : index;
}

/** SymptomDeltaList가 기대하는 형태로 매핑. key·trend가 알려진 값이 아니면 화면에서 제외한다. */
function toSymptomDelta(symptom: FeedbackSymptomComparison): SymptomDelta | null {
  const key = SymptomKey.safeParse(symptom.type);
  const trend = Trend.safeParse(symptom.trend);
  if (!key.success || !trend.success) return null;

  return {
    key: key.data,
    before: labelToIntensity(symptom.previousLabel),
    after: labelToIntensity(symptom.currentLabel),
    trend: trend.data,
  };
}

/** analysisTags 고정 객체를 칩 목록으로 변환. 값이 없거나 0이면 생략한다. */
function toEvidenceChips(tags: FeedbackResponse['analysisTags']): { label: string }[] {
  const chips: { label: string }[] = [];
  if (tags.treatmentDay) chips.push({ label: tags.treatmentDay });
  if (tags.checklistRate) chips.push({ label: `체크리스트 이행률 ${tags.checklistRate}%` });
  if (tags.photoCount) chips.push({ label: `사진 ${tags.photoCount}장` });
  return chips;
}

/** 실 API 응답을 FeedbackPage가 기대하는 뷰모델로 변환한다. */
function toAiFeedback(raw: FeedbackResponse): AiFeedback {
  const { comparison } = raw;

  return {
    id: String(raw.feedbackId),
    cardId: String(raw.cardId),
    // TODO: API에 카드 이름 필드가 없어 treatmentName으로 대체. 부적절하면 GET /api/cards/:cardId로 별도 조회 필요.
    cardName: raw.treatmentName,
    contextLabel: `D+${raw.dday}`,
    before: {
      ddayLabel: `D+${comparison.previousDDay}`,
      photoUrl: comparison.previousPhotoUrl,
    },
    after: {
      ddayLabel: `D+${raw.dday}`,
      photoUrl: comparison.currentPhotoUrl,
    },
    deltas: comparison.symptoms
      .map(toSymptomDelta)
      .filter((delta): delta is SymptomDelta => delta !== null),
    quotedMemo: comparison.userComment,
    analysis: raw.analysisSummary,
    evidence: toEvidenceChips(raw.analysisTags),
    intensityReview: raw.intensityReview,
    todayCare: raw.todayCare,
    advice: {
      required: raw.needsConsultation,
      message: raw.needsConsultation
        ? (raw.consultationMessage ?? '')
        : '지금은 의료기관 문의가 필요한 상태는 아니에요. 부기나 통증이 심해지거나 고름·발열이 있으면 바로 알려드릴게요.',
      criteria: raw.consultationCriteria,
    },
  };
}

export function useFeedback(recordId: string) {
  return useQuery({
    queryKey: ['feedback', recordId],
    queryFn: async () => toAiFeedback(await getFeedback(recordId)),
    enabled: Boolean(recordId),
  });
}

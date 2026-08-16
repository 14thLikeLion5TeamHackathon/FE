/**
 * MSW가 돌려줄 더미 데이터. 시안의 값을 그대로 옮겼다.
 * BE가 배포되면 해당 핸들러를 지우면 되고, 이 파일도 같이 줄어든다.
 */

export const feedback = {
  id: 'fb-1',
  cardId: 'card-1',
  cardName: '포텐자',
  contextLabel: 'D+7 · 오늘 기록',
  before: { ddayLabel: 'D+3', photoUrl: null },
  after: { ddayLabel: 'D+7 · 오늘', photoUrl: null },
  deltas: [
    { key: 'SWELLING', before: 2, after: 1, trend: 'DOWN' },
    { key: 'PAIN', before: 1, after: 1, trend: 'SAME' },
    { key: 'REDNESS', before: 3, after: 2, trend: 'DOWN' },
    { key: 'DRYNESS', before: 1, after: 2, trend: 'UP' },
  ],
  quotedMemo: '붉은기가 어제보다 옅어졌어요',
  analysis:
    '회복이 예상 범위 안에 있어요. D+7 기준으로 부기와 붉은기가 모두 줄었고, 케어도 잘 지키고 계세요.',
  evidence: [{ label: '포텐자 D+7' }, { label: '체크리스트 67%' }, { label: '사진 2장' }],
  intensityReview: "기록하신 부기는 '보통'인데, 사진상으로는 D+7 평균보다 조금 가라앉은 편이에요.",
  todayCare: [
    '자극성 화장품을 피하고 자외선 차단을 유지해주세요',
    '부기가 남아 있으니 취침 시 베개를 높여주세요',
  ],
  advice: {
    required: false,
    message: '지금은 의료기관 문의가 필요한 상태는 아니에요. 부기나 통증이 심해지거나 고름·발열이 있으면 바로 알려드릴게요.',
    criteria: null,
  },
};

/**
 * 문의 권고 케이스. 시안 「AI 피드백 — 문의 권고」에 해당한다.
 * `/records/warn/feedback`으로 들어가면 이 응답이 온다 — 정상 케이스와 나란히 확인하려는 목적.
 */
export const feedbackWarning = {
  ...feedback,
  id: 'fb-2',
  deltas: [
    { key: 'SWELLING', before: 1, after: 3, trend: 'UP' },
    { key: 'PAIN', before: 1, after: 3, trend: 'UP' },
    { key: 'REDNESS', before: 2, after: 2, trend: 'SAME' },
    { key: 'DRYNESS', before: 1, after: 2, trend: 'UP' },
  ],
  quotedMemo: '어제보다 더 부은 것 같아요',
  analysis:
    '부기와 통증이 예상 범위를 벗어나고 있어요. D+7이면 줄어드는 시기인데 이틀째 \'심함\'으로 기록되고 있습니다.',
  intensityReview: "기록하신 부기 '심함'은 사진과도 일치해요. D+7 평균보다 높은 편입니다.",
  advice: {
    required: true,
    message: '부기와 통증이 이틀 연속 \'심함\'이에요. 시술 기관에 문의해보시는 걸 권해드려요.',
    criteria: '강도 3이 2일 이상 지속',
  },
};

export const schedules = [
  { id: 's-1', title: '팀 회식', date: '2026.08.03', time: '오후 7:00', place: '강남역', editable: true },
];

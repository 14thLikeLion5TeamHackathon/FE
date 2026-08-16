/**
 * MSW가 돌려줄 더미 데이터. 시안의 값을 그대로 옮겼다.
 * BE가 배포되면 해당 핸들러를 지우면 되고, 이 파일도 같이 줄어든다.
 */

export const cards = [
  {
    cardId: 1,
    treatmentName: '포텐자',
    treatmentDate: '2026-07-25',
    dday: 7,
    recoveryTotalDays: 29,
    status: 'IN_PROGRESS',
    recordId: null,
    recordedAt: null,
    photoUrl: null,
    statusDescription: null,
    redness: null,
    swelling: null,
    pain: null,
    dryness: null,
    aiFeedback: null,
  },
  {
    cardId: 2,
    treatmentName: '스킨부스터',
    treatmentDate: '2026-07-28',
    dday: 4,
    recoveryTotalDays: 29,
    status: 'IN_PROGRESS',
    recordId: null,
    recordedAt: null,
    photoUrl: null,
    statusDescription: null,
    redness: null,
    swelling: null,
    pain: null,
    dryness: null,
    aiFeedback: null,
  },
  {
    cardId: 3,
    treatmentName: '울쎄라',
    treatmentDate: '2026-06-28',
    dday: 34,
    recoveryTotalDays: 29,
    status: 'DONE',
    recordId: null,
    recordedAt: null,
    photoUrl: null,
    statusDescription: null,
    redness: null,
    swelling: null,
    pain: null,
    dryness: null,
    aiFeedback: null,
  },
];

export const cardDetail = {
  cardId: 1,
  treatmentName: '포텐자',
  treatmentDate: '2026-07-25',
  recoveryTotalDays: 29,
  recoveryTransitionDay: 14,
  todayCare: ['자극성 화장품 사용을 피하고 자외선 차단을 유지해주세요.', '부기가 남아 있으니 취침 시 베개를 높여주세요.'],
  feedbackQuota: { used: 1, total: 3 },
  visitedStore: null,
  dday: 7,
};

export const treatments = [
  {
    treatmentId: 1,
    name: '초음파 보톡스',
    description: '사각턱, 승모근 등 근육 축소',
    category: 'DRUG',
    thumbnailUrl: 'https://picsum.photos/seed/t-1/200/200',
  },
  {
    treatmentId: 2,
    name: '튠 프리미엄',
    description: '페이스 리프팅 및 탄력 개선',
    category: 'DEVICE',
    thumbnailUrl: 'https://picsum.photos/seed/t-2/200/200',
  },
  {
    treatmentId: 3,
    name: '릴리이드 하이드로',
    description: '피부 속 건조 해결 및 수분 충전',
    category: 'FNB',
    thumbnailUrl: 'https://picsum.photos/seed/t-3/200/200',
  },
  {
    treatmentId: 4,
    name: '리쥬란 힐러',
    description: '피부 재생 및 잔주름 개선 물질 주입',
    category: 'DRUG',
    thumbnailUrl: 'https://picsum.photos/seed/t-4/200/200',
  },
  {
    treatmentId: 5,
    name: '연어주사',
    description: '콜라겐 생성 촉진 및 피부 탄력 개선',
    category: 'DRUG',
    thumbnailUrl: 'https://picsum.photos/seed/t-5/200/200',
  },
  {
    treatmentId: 6,
    name: '홈케어 마스크팩',
    description: '시술 후 진정 및 보습 관리용 마스크팩',
    category: 'ETC',
    thumbnailUrl: 'https://picsum.photos/seed/t-6/200/200',
  },
];

export const records = {
  cardId: 1,
  careRecords: [
    {
      recordId: 1,
      recordedAt: '2026-07-28',
      photoUrls: [],
      statusDescription: '어제보다 부은 것 같아요',
      redness: 3,
      swelling: 2,
      pain: 1,
      dryness: 1,
      aiFeedback: null,
      dday: 3,
    },
    {
      recordId: 2,
      recordedAt: '2026-08-01',
      photoUrls: ['https://placehold.co/600x600/png'],
      statusDescription: '붉은기가 어제보다 옅어졌어요',
      redness: 2,
      swelling: 1,
      pain: 1,
      dryness: 2,
      aiFeedback: {
        feedbackId: 1,
        changeSummary: '부기와 붉은기가 감소하고 있어요',
        careGuidance: '자외선 차단을 유지해주세요',
        needsConsultation: false,
      },
      dday: 7,
    },
  ],
};

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

export const recovery = {
  inProgress: [cards[0], cards[1]],
  done: [cards[2]],
  curve: {
    cardId: 1,
    points: [
      { recordId: 'p-1', ddayLabel: 'D+1', dateLabel: '07.26', photoUrl: null, symptoms: [{ key: 'SWELLING', intensity: 3 }, { key: 'PAIN', intensity: 2 }, { key: 'REDNESS', intensity: 3 }, { key: 'DRYNESS', intensity: 1 }] },
      { recordId: 'p-2', ddayLabel: 'D+3', dateLabel: '07.28', photoUrl: null, symptoms: [{ key: 'SWELLING', intensity: 3 }, { key: 'PAIN', intensity: 2 }, { key: 'REDNESS', intensity: 2 }, { key: 'DRYNESS', intensity: 2 }] },
      { recordId: 'p-3', ddayLabel: 'D+7', dateLabel: '08.01', photoUrl: null, symptoms: [{ key: 'SWELLING', intensity: 2 }, { key: 'PAIN', intensity: 1 }, { key: 'REDNESS', intensity: 2 }, { key: 'DRYNESS', intensity: 2 }] },
      { recordId: 'p-4', ddayLabel: 'D+10', dateLabel: '08.04', photoUrl: null, symptoms: [{ key: 'SWELLING', intensity: 2 }, { key: 'PAIN', intensity: 1 }, { key: 'REDNESS', intensity: 1 }, { key: 'DRYNESS', intensity: 2 }] },
      { recordId: 'p-5', ddayLabel: 'D+14', dateLabel: '08.08', photoUrl: null, symptoms: [{ key: 'SWELLING', intensity: 1 }, { key: 'PAIN', intensity: 1 }, { key: 'REDNESS', intensity: 1 }, { key: 'DRYNESS', intensity: 1 }] },
      { recordId: 'p-6', ddayLabel: 'D+18', dateLabel: '08.12', photoUrl: null, symptoms: [{ key: 'SWELLING', intensity: 1 }, { key: 'PAIN', intensity: 0 }, { key: 'REDNESS', intensity: 1 }, { key: 'DRYNESS', intensity: 1 }] },
      { recordId: 'p-7', ddayLabel: 'D+23', dateLabel: '08.17', photoUrl: null, symptoms: [{ key: 'SWELLING', intensity: 0 }, { key: 'PAIN', intensity: 0 }, { key: 'REDNESS', intensity: 0 }, { key: 'DRYNESS', intensity: 1 }] },
    ],
    comparedIndexes: [0, 6],
  },
};

export const schedules = [
  { id: 's-1', title: '팀 회식', date: '2026.08.03', time: '오후 7:00', place: '강남역', editable: true },
];

export const myProfile = {
  userId: 1,
  name: '최서연',
  birthDate: '2007-05-17',
  gender: 'FEMALE',
  hasAacOfflineExperience: true,
  agreePersonalInfo: true,
  agreeHealthData: true,
  agreeCalendarData: true,
};

/**
 * MSW가 돌려줄 더미 데이터. 시안의 값을 그대로 옮겼다.
 * BE가 배포되면 해당 핸들러를 지우면 되고, 이 파일도 같이 줄어든다.
 */

export const cards = [
  {
    id: 'card-1',
    name: '포텐자',
    treatedAt: '2026.07.25',
    dday: 7,
    totalDays: 29,
    status: 'IN_PROGRESS',
    todayCare: '자극성 화장품 사용을 피하고 자외선 차단을 유지해주세요.',
    recordRecommended: true,
  },
  {
    id: 'card-2',
    name: '스킨부스터',
    treatedAt: '2026.07.28',
    dday: 4,
    totalDays: 29,
    status: 'IN_PROGRESS',
    todayCare: '주입 부위를 문지르지 말고 충분히 보습해주세요.',
    recordRecommended: false,
  },
  {
    id: 'card-3',
    name: '울쎄라',
    treatedAt: '2026.06.28',
    dday: 34,
    totalDays: 29,
    status: 'DONE',
    todayCare: '회복이 끝났어요. 평소 루틴을 유지하세요.',
    recordRecommended: false,
  },
];

export const cardDetail = {
  ...cards[0],
  guide: [
    { range: 'D+1~3', description: '부기와 붉은기가 가장 심한 시기', current: false },
    { range: 'D+4~7', description: '부기가 빠지기 시작해요', current: true },
    { range: 'D+8~14', description: '피부결이 정리되는 시기', current: false },
    { range: 'D+15~29', description: '최종 결과가 자리잡는 시기', current: false },
  ],
  cautions: [
    '연고를 하루 2회, D+10까지 발라주세요',
    '사우나·격한 운동은 D+14까지 피해주세요',
    '음주는 부기를 키울 수 있어 D+7까지 권하지 않아요',
  ],
  storeVisit: null,
};

export const today = {
  briefing: {
    state: 'FULL',
    dateLabel: '8월 3일 (월)',
    weather: '맑음 31°',
    message: '자외선이 높고 저녁에 술자리가 있어요. 외출 전 차단제를 덧바르고 음주량을 줄여주세요.',
    metrics: [
      { label: '자외선', value: '높음', level: 'HIGH' },
      { label: '미세먼지', value: '보통', level: 'MODERATE' },
      { label: '습도', value: '65%', level: 'MODERATE' },
    ],
    evidence: [{ label: 'D+7 포텐자' }, { label: '일정 2건' }],
    schedules: [
      { id: 's-1', title: '팀 회식', time: '오후 7:00', place: '강남역', editable: true },
      { id: 's-2', title: '외부 미팅', time: '오후 2:00', place: null, editable: false },
    ],
  },
  checklist: [
    { id: 'c-1', label: '연고 바르기', done: true, source: '스컬트라 D+7' },
    { id: 'c-2', label: '선크림 2중 도포', done: false, source: '스컬트라 D+7' },
    { id: 'c-3', label: '물 2L 마시기', done: false, source: '포텐자 D+3' },
  ],
  // 8월 한 달치. 주의일은 일정·자외선·회복 분기점이 있는 날, 예보 범위는 8/16까지.
  calendar: Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return {
      date: `2026-08-${String(day).padStart(2, '0')}`,
      marked: [2, 3, 5, 9, 12, 14].includes(day),
      outOfForecast: day > 16,
    };
  }),
  forecastNote: '예보는 8월 16일까지 제공돼요',
};

export const records = [
  {
    id: 'rec-1',
    cardId: 'card-1',
    recordedAt: '07.28',
    dday: 3,
    photoUrls: [],
    memo: '어제보다 부은 것 같아요',
    symptoms: [
      { key: 'SWELLING', intensity: 2 },
      { key: 'PAIN', intensity: 1 },
      { key: 'REDNESS', intensity: 3 },
      { key: 'DRYNESS', intensity: 1 },
    ],
  },
  {
    id: 'rec-2',
    cardId: 'card-1',
    recordedAt: '08.01',
    dday: 7,
    photoUrls: [],
    memo: '붉은기가 어제보다 옅어졌어요',
    symptoms: [
      { key: 'SWELLING', intensity: 1 },
      { key: 'PAIN', intensity: 1 },
      { key: 'REDNESS', intensity: 2 },
      { key: 'DRYNESS', intensity: 2 },
    ],
  },
];

export const recovery = {
  inProgress: [cards[0], cards[1]],
  done: [cards[2]],
  curve: {
    cardId: 'card-1',
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
  name: '최서연',
  birthDate: '2007.05.17',
  gender: 'FEMALE',
  calendarEmail: 'kimsu3047@gmail.com',
  notifications: { all: true, dailyCare: true, recordReminder: true, preWarning: true },
};

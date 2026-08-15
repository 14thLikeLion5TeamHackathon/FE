/**
 * 오늘 탭이 서버에 넘기는 위치.
 *
 * 서버가 시·구 이름을 좌표로 바꿔서 쓰므로(`LOCATION_MAP`), 프론트는 이름만 보낸다.
 * 서버가 아는 조합만 골라야 하기 때문에 보기도 그 표를 그대로 옮겼다 —
 * 지금은 5개 광역시뿐이라 나머지 시·도는 아예 내놓지 않는다.
 *
 * 줄임 표현("서울")도 서버가 받아주지만 표준 명칭("서울특별시")을 보낸다.
 * 별칭 처리에 기대면 서버가 그 분기를 지울 때 조용히 깨진다.
 */

export type TodayLocation = { city: string; district: string };

/** label은 칩에 쓰는 짧은 이름, name은 서버에 보내는 표준 명칭 */
export type City = { id: string; label: string; name: string; districts: string[] };

export const CITIES: City[] = [
  {
    id: 'seoul',
    label: '서울',
    name: '서울특별시',
    districts: [
      '강남구',
      '강동구',
      '강북구',
      '강서구',
      '관악구',
      '광진구',
      '구로구',
      '금천구',
      '노원구',
      '도봉구',
      '동대문구',
      '동작구',
      '마포구',
      '서대문구',
      '서초구',
      '성동구',
      '성북구',
      '송파구',
      '양천구',
      '영등포구',
      '용산구',
      '은평구',
      '종로구',
      '중구',
      '중랑구',
    ],
  },
  {
    id: 'busan',
    label: '부산',
    name: '부산광역시',
    // 서버 표에는 '진구'도 있지만 '부산진구'와 같은 좌표를 가리키는 별칭이라 하나만 내놓는다
    districts: [
      '강서구',
      '금정구',
      '기장군',
      '남구',
      '동구',
      '동래구',
      '부산진구',
      '북구',
      '사상구',
      '사하구',
      '서구',
      '수영구',
      '연제구',
      '영도구',
      '중구',
      '해운대구',
    ],
  },
  {
    id: 'daegu',
    label: '대구',
    name: '대구광역시',
    districts: [
      '남구',
      '달서구',
      '달성군',
      '동구',
      '북구',
      '서구',
      '수성구',
      '중구',
      '군위군',
    ],
  },
  {
    id: 'incheon',
    label: '인천',
    name: '인천광역시',
    districts: [
      '강화군',
      '계양구',
      '남동구',
      '동구',
      '미추홀구',
      '부평구',
      '서구',
      '연수구',
      '옹진군',
      '중구',
    ],
  },
  {
    id: 'gwangju',
    label: '광주',
    name: '광주광역시',
    districts: ['광산구', '남구', '동구', '북구', '서구'],
  },
];

/** 아직 아무것도 고르지 않았을 때 기준으로 삼는 위치 */
export const DEFAULT_LOCATION: TodayLocation = {
  city: CITIES[0].name,
  district: CITIES[0].districts[0],
};

export function findCity(name: string): City | null {
  return CITIES.find((city) => city.name === name) ?? null;
}

/** 서버가 아는 조합인지. 표가 바뀌어 사라진 값이 저장돼 있을 수 있다 */
export function isKnownLocation({ city, district }: TodayLocation): boolean {
  return findCity(city)?.districts.includes(district) ?? false;
}

/** "서울 강남구" — 화면에 쓰는 짧은 이름 */
export function formatLocation({ city, district }: TodayLocation): string {
  return `${findCity(city)?.label ?? city} ${district}`;
}

const LOCATION_KEY = 'todayLocation';

export function getStoredLocation(): TodayLocation | null {
  const raw = localStorage.getItem(LOCATION_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as TodayLocation).city === 'string' &&
      typeof (parsed as TodayLocation).district === 'string' &&
      isKnownLocation(parsed as TodayLocation)
    ) {
      return parsed as TodayLocation;
    }
  } catch {
    // 손상된 값은 없는 것으로 친다
  }
  return null;
}

export function setStoredLocation(location: TodayLocation) {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}

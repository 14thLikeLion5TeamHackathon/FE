/**
 * 위치 관련 유틸.
 * 오늘 탭 브리핑은 시·구 단위로 날씨가 다르므로 기준 위치를 관리한다.
 */

export type TodayLocation = {
  city: string;
  district: string;
};

/* ── 기본 위치 ──────────────────────────────────────────── */

export const DEFAULT_LOCATION: TodayLocation = {
  city: '서울특별시',
  district: '강남구',
};

/** 카드 상세·기록 등록에서 사용하는 위치 파라미터 */
export function getLocationParams(): TodayLocation {
  return getStoredLocation() ?? DEFAULT_LOCATION;
}

/* ── localStorage 유지 ──────────────────────────────────── */

const STORAGE_KEY = 'today-location';

export function getStoredLocation(): TodayLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TodayLocation;
    // 목록에 없는 조합은 버린다. 서버가 모르는 지역을 받으면 에러 없이 엉뚱한 기본값으로
    // 떨어져서, 사용자는 다른 동네 날씨를 자기 동네로 알고 본다.
    return isKnownLocation(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** 시·구가 모두 CITIES에 있는 조합인지 */
export function isKnownLocation(location: TodayLocation): boolean {
  const city = findCity(location.city);
  return Boolean(city?.districts.includes(location.district));
}

export function setStoredLocation(location: TodayLocation): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

/* ── 시·구 데이터 (LocationPicker용) ─────────────────────── */

/**
 * 서버가 좌표로 풀 수 있는 지역만 담는다 — 서울·부산·대구·인천·광주 5개 광역시.
 *
 * 서버는 이 문자열을 자기 표에서 찾아 좌표로 바꾼다. **표에 없으면 에러 없이 기본 좌표로
 * 떨어진다** — 대전과 울산을 넣어 뒀을 때 둘이 완전히 같은 값(28.24°)을 돌려줬다.
 * 사용자는 자기 동네 날씨라고 믿고 남의 동네 값을 보게 되므로, 고를 수 없게 빼 둔다.
 *
 * 지역을 넓히려면 서버 표가 먼저 늘어야 한다. 여기만 늘리면 조용히 틀린 값이 된다.
 */

export type CityEntry = {
  id: string;
  name: string;
  label: string;
  districts: string[];
};

export const CITIES: CityEntry[] = [
  {
    id: 'seoul',
    name: '서울특별시',
    label: '서울',
    districts: [
      '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
      '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
      '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구',
    ],
  },
  {
    id: 'busan',
    name: '부산광역시',
    label: '부산',
    districts: [
      '강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구',
      '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구',
    ],
  },
  {
    id: 'incheon',
    name: '인천광역시',
    label: '인천',
    districts: [
      '강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구',
    ],
  },
  {
    id: 'daegu',
    name: '대구광역시',
    label: '대구',
    districts: ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
  },
  {
    id: 'gwangju',
    name: '광주광역시',
    label: '광주',
    districts: ['광산구', '남구', '동구', '북구', '서구'],
  },
];

/** 시 이름("서울특별시")으로 CityEntry를 찾는다 */
export function findCity(name: string): CityEntry | undefined {
  return CITIES.find((c) => c.name === name);
}

/** "서울특별시 강남구" → "서울 강남구" */
export function formatLocation(loc: TodayLocation): string {
  const city = CITIES.find((c) => c.name === loc.city);
  return `${city?.label ?? loc.city} ${loc.district}`;
}

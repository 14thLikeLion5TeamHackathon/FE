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

/** 저장된 위치를 지운다 — GPS 모드로 되돌릴 때 사용 */
export function clearStoredLocation(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/* ── 시·구 데이터 (LocationPicker용) ─────────────────────── */

/**
 * 17개 광역시도 전체. 좌표로 조회하므로 서버의 지역명 표에 매이지 않는다.
 *
 * 한때 5개 광역시만 담았다 — 서버가 시·구 **이름**을 자기 표에서 찾아 좌표로 바꾸는데,
 * 표에 없으면 에러 없이 서울 중구로 떨어져서 사용자가 남의 동네 날씨를 자기 것으로 믿게 됐다.
 * 지금은 프론트가 좌표를 직접 보내므로 그 표를 거치지 않는다.
 *
 * **단, 브리핑(`/today/briefing`)은 아직 이름 경로다.** 서버에 저장된 시·구 문자열로 날씨를
 * 구해서, 표에 없는 지역은 브리핑만 서울 기준으로 남는다. 날씨 카드는 정확하다.
 * 서버가 저장된 좌표를 쓰도록 바뀌면 그 차이도 사라진다 (BE 요청 완료).
 */

export type CityEntry = {
  id: string;
  name: string;
  label: string;
  districts: string[];
  /**
   * 시청·도청 좌표.
   *
   * 구·군마다 좌표를 두지 않는 건 **정밀도를 지어내지 않기 위해서다.** 250여 개 시군구
   * 좌표를 손으로 채우면 하나만 어긋나도 조용히 틀린 날씨가 되고, 검증할 방법도 없다.
   * 날씨는 시 단위면 충분히 맞고, 그보다 정확한 값이 필요한 사용자는 GPS를 켜면 된다
   * (`useTodayGeolocation` — 권한을 준 경우 이 좌표 대신 실제 좌표를 쓴다).
   *
   * 그래서 고른 **구 이름은 화면 표시용**이다. 서버에 저장되는 위치도 좌표 기준이라,
   * 서버가 역지오코딩으로 만들어내는 구 이름은 고른 것과 다를 수 있다.
   */
  coords: Coords;
};

/** `PATCH /api/v1/mypage/location`이 받는 형태 */
export type Coords = {
  latitude: number;
  longitude: number;
};

export const CITIES: CityEntry[] = [
  {
    id: 'seoul',
    coords: { latitude: 37.5665, longitude: 126.978 },
    name: '서울특별시',
    label: '서울',
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
    coords: { latitude: 35.1796, longitude: 129.0756 },
    name: '부산광역시',
    label: '부산',
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
    coords: { latitude: 35.8714, longitude: 128.6014 },
    name: '대구광역시',
    label: '대구',
    districts: ['남구', '달서구', '달성군', '동구', '군위군', '북구', '서구', '수성구', '중구'],
  },
  {
    id: 'incheon',
    coords: { latitude: 37.4563, longitude: 126.7052 },
    name: '인천광역시',
    label: '인천',
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
    coords: { latitude: 35.1595, longitude: 126.8526 },
    name: '광주광역시',
    label: '광주',
    districts: ['광산구', '남구', '동구', '북구', '서구'],
  },
  {
    id: 'daejeon',
    coords: { latitude: 36.3504, longitude: 127.3845 },
    name: '대전광역시',
    label: '대전',
    districts: ['대덕구', '동구', '서구', '유성구', '중구'],
  },
  {
    id: 'ulsan',
    coords: { latitude: 35.5384, longitude: 129.3114 },
    name: '울산광역시',
    label: '울산',
    districts: ['남구', '동구', '북구', '울주군', '중구'],
  },
  {
    id: 'sejong',
    coords: { latitude: 36.4801, longitude: 127.289 },
    name: '세종특별자치시',
    label: '세종',
    // 세종은 자치구가 없다. 선택 단계를 없애는 대신 한 항목만 둔다
    districts: ['세종시'],
  },
  {
    id: 'gyeonggi',
    coords: { latitude: 37.275, longitude: 127.0095 },
    name: '경기도',
    label: '경기',
    districts: [
      '가평군',
      '고양시',
      '과천시',
      '광명시',
      '광주시',
      '구리시',
      '군포시',
      '김포시',
      '남양주시',
      '동두천시',
      '부천시',
      '성남시',
      '수원시',
      '시흥시',
      '안산시',
      '안성시',
      '안양시',
      '양주시',
      '양평군',
      '여주시',
      '연천군',
      '오산시',
      '용인시',
      '의왕시',
      '의정부시',
      '이천시',
      '파주시',
      '평택시',
      '포천시',
      '하남시',
      '화성시',
    ],
  },
  {
    id: 'gangwon',
    coords: { latitude: 37.8813, longitude: 127.73 },
    name: '강원특별자치도',
    label: '강원',
    districts: [
      '강릉시',
      '고성군',
      '동해시',
      '삼척시',
      '속초시',
      '양구군',
      '양양군',
      '영월군',
      '원주시',
      '인제군',
      '정선군',
      '철원군',
      '춘천시',
      '태백시',
      '평창군',
      '홍천군',
      '화천군',
      '횡성군',
    ],
  },
  {
    id: 'chungbuk',
    coords: { latitude: 36.6357, longitude: 127.4913 },
    name: '충청북도',
    label: '충북',
    districts: [
      '괴산군',
      '단양군',
      '보은군',
      '영동군',
      '옥천군',
      '음성군',
      '제천시',
      '증평군',
      '진천군',
      '청주시',
      '충주시',
    ],
  },
  {
    id: 'chungnam',
    coords: { latitude: 36.6588, longitude: 126.6728 },
    name: '충청남도',
    label: '충남',
    districts: [
      '계룡시',
      '공주시',
      '금산군',
      '논산시',
      '당진시',
      '보령시',
      '부여군',
      '서산시',
      '서천군',
      '아산시',
      '예산군',
      '천안시',
      '청양군',
      '태안군',
      '홍성군',
    ],
  },
  {
    id: 'jeonbuk',
    coords: { latitude: 35.8203, longitude: 127.1088 },
    name: '전북특별자치도',
    label: '전북',
    districts: [
      '고창군',
      '군산시',
      '김제시',
      '남원시',
      '무주군',
      '부안군',
      '순창군',
      '완주군',
      '익산시',
      '임실군',
      '장수군',
      '전주시',
      '정읍시',
      '진안군',
    ],
  },
  {
    id: 'jeonnam',
    coords: { latitude: 34.8161, longitude: 126.4629 },
    name: '전라남도',
    label: '전남',
    districts: [
      '강진군',
      '고흥군',
      '곡성군',
      '광양시',
      '구례군',
      '나주시',
      '담양군',
      '목포시',
      '무안군',
      '보성군',
      '순천시',
      '신안군',
      '여수시',
      '영광군',
      '영암군',
      '완도군',
      '장성군',
      '장흥군',
      '진도군',
      '함평군',
      '해남군',
      '화순군',
    ],
  },
  {
    id: 'gyeongbuk',
    coords: { latitude: 36.576, longitude: 128.5056 },
    name: '경상북도',
    label: '경북',
    districts: [
      '경산시',
      '경주시',
      '고령군',
      '구미시',
      '김천시',
      '문경시',
      '봉화군',
      '상주시',
      '성주군',
      '안동시',
      '영덕군',
      '영양군',
      '영주시',
      '영천시',
      '예천군',
      '울릉군',
      '울진군',
      '의성군',
      '청도군',
      '청송군',
      '칠곡군',
      '포항시',
    ],
  },
  {
    id: 'gyeongnam',
    coords: { latitude: 35.2383, longitude: 128.6924 },
    name: '경상남도',
    label: '경남',
    districts: [
      '거제시',
      '거창군',
      '고성군',
      '김해시',
      '남해군',
      '밀양시',
      '사천시',
      '산청군',
      '양산시',
      '의령군',
      '진주시',
      '창녕군',
      '창원시',
      '통영시',
      '하동군',
      '함안군',
      '함양군',
      '합천군',
    ],
  },
  {
    id: 'jeju',
    coords: { latitude: 33.489, longitude: 126.4983 },
    name: '제주특별자치도',
    label: '제주',
    districts: ['서귀포시', '제주시'],
  },
];

/** 시 이름("서울특별시")으로 CityEntry를 찾는다 */
export function findCity(name: string): CityEntry | undefined {
  return CITIES.find((c) => c.name === name);
}

/** 저장할 좌표. 목록에 없는 시면 null이라 호출부가 요청을 건너뛴다 */
export function locationCoords(loc: TodayLocation): Coords | null {
  return findCity(loc.city)?.coords ?? null;
}

/** 아무것도 정해지지 않았을 때 쓰는 좌표 */
export const DEFAULT_COORDS: Coords = findCity(DEFAULT_LOCATION.city)?.coords ?? {
  latitude: 37.5665,
  longitude: 126.978,
};

/** "서울특별시 강남구" → "서울 강남구", "세종특별자치시 세종시" → "세종시" */
export function formatLocation(loc: TodayLocation): string {
  const label = CITIES.find((c) => c.name === loc.city)?.label ?? loc.city;
  // 세종처럼 시 이름과 하위 항목이 겹치면 한 번만 쓴다 — "세종 세종시"는 읽히지 않는다
  if (loc.district.startsWith(label)) return loc.district;
  return `${label} ${loc.district}`;
}

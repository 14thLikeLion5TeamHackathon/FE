/**
 * 오늘 탭이 서버에 넘기는 위치.
 *
 * 서버는 좌표(위도·경도)만 받는다 — 지역을 골라도 그 지역의 대표 좌표를 보낸다.
 * 그래서 "GPS냐 직접 선택이냐"는 프론트 안에서만 구분되고, 요청 모양은 하나로 유지된다.
 */

export type Coords = { lat: number; lng: number };

export type Region = { id: string; label: string } & Coords;

/** 위치를 직접 고를 때 쓰는 보기 — 17개 시·도, 좌표는 시청·도청 소재지 기준 */
export const REGIONS: Region[] = [
  { id: 'seoul', label: '서울', lat: 37.5665, lng: 126.978 },
  { id: 'busan', label: '부산', lat: 35.1796, lng: 129.0756 },
  { id: 'daegu', label: '대구', lat: 35.8714, lng: 128.6014 },
  { id: 'incheon', label: '인천', lat: 37.4563, lng: 126.7052 },
  { id: 'gwangju', label: '광주', lat: 35.1595, lng: 126.8526 },
  { id: 'daejeon', label: '대전', lat: 36.3504, lng: 127.3845 },
  { id: 'ulsan', label: '울산', lat: 35.5384, lng: 129.3114 },
  { id: 'sejong', label: '세종', lat: 36.4801, lng: 127.289 },
  { id: 'gyeonggi', label: '경기', lat: 37.2636, lng: 127.0286 },
  { id: 'gangwon', label: '강원', lat: 37.8813, lng: 127.73 },
  { id: 'chungbuk', label: '충북', lat: 36.6424, lng: 127.489 },
  { id: 'chungnam', label: '충남', lat: 36.6588, lng: 126.6728 },
  { id: 'jeonbuk', label: '전북', lat: 35.8242, lng: 127.148 },
  { id: 'jeonnam', label: '전남', lat: 34.8161, lng: 126.463 },
  { id: 'gyeongbuk', label: '경북', lat: 36.5684, lng: 128.7294 },
  { id: 'gyeongnam', label: '경남', lat: 35.228, lng: 128.6811 },
  { id: 'jeju', label: '제주', lat: 33.4996, lng: 126.5312 },
];

/** GPS를 못 쓸 때(권한 거부·미지원·타임아웃) 기준으로 삼는 지역 */
export const FALLBACK_REGION = REGIONS[0];

export function findRegion(id: string | null): Region | null {
  if (!id) return null;
  return REGIONS.find((region) => region.id === id) ?? null;
}

const REGION_KEY = 'todayRegionId';

/** 직접 고른 지역. null이면 "현재 위치(GPS)"라는 뜻 — 첫 방문의 기본값이다. */
export function getStoredRegionId(): string | null {
  const stored = localStorage.getItem(REGION_KEY);
  return findRegion(stored) ? stored : null;
}

export function setStoredRegionId(id: string | null) {
  if (id === null) localStorage.removeItem(REGION_KEY);
  else localStorage.setItem(REGION_KEY, id);
}

/**
 * 브라우저 GPS 좌표.
 * 권한 팝업 앞에서 사용자가 아무것도 안 누르면 콜백이 영영 안 오므로 timeout을 반드시 준다.
 */
export function getCurrentCoords(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => reject(error),
      { timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

/**
 * 쿼리 키에 넣을 좌표.
 * GPS는 가만히 있어도 소수점 끝자리가 흔들려서, 그대로 키에 쓰면 화면이 뜰 때마다 재요청이 된다.
 * 소수점 4자리면 약 10m — 예보 격자보다 훨씬 촘촘하다.
 */
export function roundCoords({ lat, lng }: Coords): Coords {
  return { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) };
}

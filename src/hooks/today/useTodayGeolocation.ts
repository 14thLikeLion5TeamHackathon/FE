import { useEffect, useState } from 'react';

/**
 * 좌표 권한의 진행 상태.
 * 'unavailable'은 권한은 막히지 않았는데 측위가 실패한 경우다 —
 * 거부와 같은 문구를 쓰면 권한을 이미 준 사용자에게 거짓말이 된다.
 */
export type GeolocationStatus =
  | 'prompting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'unsupported';

export type Coords = {
  latitude: number;
  longitude: number;
};

/**
 * 한 번 거부한 사실을 우리 쪽에도 남긴다.
 * 브라우저가 거부를 얼마나 기억하는지는 설정·시크릿창에 따라 달라서,
 * 이게 없으면 오늘 탭에 들어올 때마다 팝업이 뜨는 사용자가 생긴다.
 */
const DENIED_KEY = 'today-geolocation-denied';

/** 오늘 탭 첫 진입 때 한 번만 물어본다 */
const OPTIONS: PositionOptions = {
  timeout: 10_000,
  // 방금 잡은 좌표가 있으면 재측위 없이 쓴다. 시·구 단위 안내라 5분 전 좌표로 충분하다
  maximumAge: 5 * 60 * 1000,
};

/**
 * 오늘 탭의 GPS 기준 위치.
 *
 * 좌표를 얻어도 지금은 보낼 곳이 없다 — 서버가 좌표를 받는지 문의 중이라
 * 상태만 들고 화면 표시에만 쓴다. 시·구 직접 선택(useTodayLocation)은 그대로 살아 있고,
 * GPS는 그 위에 얹히는 표시일 뿐 대체가 아니다.
 *
 * TODO(#48): 서버가 좌표 파라미터를 받기로 확정되면 coords를 useToday 쿼리 키·파라미터로 내려보낸다.
 *   확정 전까지 /today/briefing 시그니처를 건드리지 않는다. (BE 문의 대기 중)
 */
export function useTodayGeolocation() {
  // 물어보기 전에 이미 알 수 있는 상태(미지원·기존 거부)는 첫 렌더에서 확정한다.
  // 이펙트에서 setState로 덮으면 안내 문구가 한 프레임 바뀌어 깜빡인다
  const [status, setStatus] = useState<GeolocationStatus>(getInitialStatus);
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    if (getInitialStatus() !== 'prompting') return;

    // 응답이 늦게 와도 떠난 화면에 setState하지 않도록 — 탭을 빨리 옮기면 실제로 남는다
    let alive = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!alive) return;
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus('granted');
      },
      (error) => {
        if (!alive) return;
        // 거부만 기억한다. 타임아웃·측위 실패는 다음 진입에 다시 시도할 값어치가 있다
        if (error.code === error.PERMISSION_DENIED) {
          localStorage.setItem(DENIED_KEY, 'true');
          setStatus('denied');
          return;
        }
        setStatus('unavailable');
      },
      OPTIONS,
    );

    return () => {
      alive = false;
    };
  }, []);

  return { status, coords };
}

/** 팝업을 띄우기 전에 이미 답이 나오는 경우들 */
function getInitialStatus(): GeolocationStatus {
  if (!('geolocation' in navigator)) return 'unsupported';
  if (localStorage.getItem(DENIED_KEY) === 'true') return 'denied';
  return 'prompting';
}

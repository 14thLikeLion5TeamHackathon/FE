import { useCallback, useEffect, useState } from 'react';

import {
  FALLBACK_REGION,
  findRegion,
  getCurrentCoords,
  getStoredRegionId,
  roundCoords,
  setStoredRegionId,
  type Coords,
} from '../../lib/location';

/**
 * 오늘 탭이 어느 위치를 기준으로 안내할지.
 *
 * 기본은 GPS다. 사용자가 지역을 직접 고르면 그 선택을 localStorage에 남겨서
 * 다음 방문에도 유지한다 — 매번 위치 권한을 다시 묻지 않게 하려는 것.
 * 권한이 거부되면 요청을 멈추는 대신 FALLBACK_REGION 기준으로 계속 안내한다.
 */
export function useTodayLocation() {
  const [regionId, setRegionId] = useState<string | null>(getStoredRegionId);
  const [gps, setGps] = useState<Coords | null>(null);
  const [gpsDenied, setGpsDenied] = useState(false);

  const region = findRegion(regionId);
  const usingGps = region === null;

  useEffect(() => {
    // 지역을 골라 뒀거나 이미 좌표를 받았으면 GPS를 다시 부르지 않는다.
    if (!usingGps || gps || gpsDenied) return;

    let alive = true;
    getCurrentCoords()
      .then((coords) => alive && setGps(coords))
      .catch(() => alive && setGpsDenied(true));

    return () => {
      alive = false;
    };
  }, [usingGps, gps, gpsDenied]);

  /** id가 null이면 "현재 위치"로 되돌린다. */
  const selectRegion = useCallback((id: string | null) => {
    setStoredRegionId(id);
    setRegionId(id);
    // 현재 위치로 돌아올 때는 거부 상태를 풀어 다시 한 번 물어본다.
    if (id === null) setGpsDenied(false);
  }, []);

  const coords = region ?? gps ?? (gpsDenied ? FALLBACK_REGION : null);

  return {
    /** 좌표가 정해지기 전에는 null — 이 동안은 오늘 조회를 보류한다. */
    coords: coords ? roundCoords(coords) : null,
    regionId,
    label: region?.label ?? (gpsDenied ? FALLBACK_REGION.label : '현재 위치'),
    isLocating: usingGps && !gps && !gpsDenied,
    /** GPS를 못 써서 대체 지역으로 안내 중인지 */
    gpsDenied,
    selectRegion,
  };
}

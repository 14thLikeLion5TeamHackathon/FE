import { useCallback, useState } from 'react';

import {
  DEFAULT_LOCATION,
  getStoredLocation,
  setStoredLocation,
  type TodayLocation,
} from '../../lib/location';

/**
 * 오늘 탭이 어느 위치를 기준으로 안내할지.
 *
 * 서버가 시·구 이름만 받으므로 GPS는 쓰지 않는다 — 좌표를 보낼 곳이 없다.
 * 고른 값은 localStorage에 남겨서 다음 방문에도 유지하고, 처음이면 DEFAULT_LOCATION으로 시작한다.
 */
export function useTodayLocation() {
  const [location, setLocation] = useState<TodayLocation>(
    () => getStoredLocation() ?? DEFAULT_LOCATION,
  );

  const selectLocation = useCallback((next: TodayLocation) => {
    setStoredLocation(next);
    setLocation(next);
  }, []);

  return { location, selectLocation };
}

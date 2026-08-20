import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateUserLocation } from '../../api/location';
import {
  DEFAULT_COORDS,
  DEFAULT_LOCATION,
  clearStoredLocation,
  getStoredLocation,
  locationCoords,
  setStoredLocation,
  type Coords,
  type TodayLocation,
} from '../../lib/location';
import { useTodayGeolocation } from './useTodayGeolocation';

/**
 * 오늘 탭이 어느 위치를 기준으로 안내할지.
 *
 * 기준이 둘이다 — **사용자가 고른 지역**과 **GPS 좌표**. 규칙은 하나다:
 * 직접 고른 적이 있으면 그게 이긴다. 한 번도 고르지 않았고 위치 권한을 줬으면 GPS를 쓴다.
 * 명시적인 선택을 좌표로 덮으면, 사용자는 자기가 고른 지역과 다른 안내를 보게 된다.
 *
 * 위치가 **두 곳에 산다.** 날씨(`/environment/weather`)는 좌표를 파라미터로 받지만,
 * 브리핑(`/today/briefing`)은 파라미터가 `date` 하나뿐이라 서버에 저장된 위치를 읽는다.
 * 그래서 기준이 바뀔 때마다 `PATCH /mypage/location`으로 서버에도 남긴다.
 *
 * 순서가 중요하다 — **저장이 끝난 뒤에** 로컬 상태를 바꾼다.
 * 상태를 먼저 바꾸면 브리핑 쿼리가 곧바로 저장 전 위치로 다시 받아 오고,
 * 화면에는 새 지역 이름 옆에 옛 지역 브리핑이 붙는다.
 */
export function useTodayLocation() {
  /** 첫 렌더에 한 번만 읽는다 — 이후 값은 아래 상태가 들고 있다 */
  const [stored] = useState(getStoredLocation);

  const [location, setLocation] = useState<TodayLocation>(stored ?? DEFAULT_LOCATION);
  /** 저장된 값이 있다는 건 예전에 직접 골랐다는 뜻이다 — 그 선택이 GPS를 이긴다 */
  const [picked, setPicked] = useState(stored !== null);

  const { status: geoStatus, coords: gpsCoords } = useTodayGeolocation();
  const queryClient = useQueryClient();

  const { mutateAsync: saveLocation } = useMutation({ mutationFn: updateUserLocation });

  /** 서버 저장 + 브리핑 무효화. 저장이 실패해도 화면은 계속 진행한다 */
  const persist = useCallback(
    async (coords: Coords) => {
      try {
        await saveLocation(coords);
      } catch {
        // 인터셉터가 이미 ApiError로 정규화하고 401이면 로그인으로 보낸다. 여기서 더 할 일이 없다.
      }
      /*
        오늘 탭을 통째로 무효화한다. 브리핑만 지우면 체크리스트가 옛 기준으로 남는다.

        **체크리스트도 위치를 본다(BE 확인).** 두 엔드포인트 모두 파라미터가 `date`
        하나뿐이라 서버에 저장된 위치를 읽는데, 쿼리 키에는 그 위치가 드러나지 않는다 —
        키가 갈리길 기다릴 수 없으니 저장이 끝난 뒤 여기서 직접 지워야 한다.
      */
      void queryClient.invalidateQueries({ queryKey: ['today'] });
    },
    [queryClient, saveLocation],
  );

  /**
   * 빠르게 여러 번 고르면 저장 응답이 순서대로 오지 않는다.
   * 마지막 선택만 화면에 반영한다 — 그러지 않으면 먼저 고른 지역이 나중에 덮어쓴다.
   */
  const selectionRef = useRef(0);

  const selectLocation = useCallback(
    async (next: TodayLocation) => {
      const selection = ++selectionRef.current;
      const coords = locationCoords(next);

      // 서버 저장이 실패해도 화면은 새 위치로 넘긴다. 날씨는 좌표로 부르니 그건 맞게 나오고,
      // 브리핑만 옛 기준으로 남는다 — 아무것도 안 바뀌는 것보다 낫다.
      if (coords) await persist(coords);
      if (selection !== selectionRef.current) return;

      setStoredLocation(next);
      setLocation(next);
      setPicked(true);
    },
    [persist],
  );

  /**
   * GPS 좌표가 잡히면 서버에도 한 번 남긴다 — 브리핑이 그 좌표를 기준으로 돌게 하려는 것.
   * 좌표는 미세하게 계속 흔들리므로 첫 값만 쓴다.
   */
  const gpsSaved = useRef(false);
  useEffect(() => {
    if (picked || !gpsCoords || gpsSaved.current) return;
    gpsSaved.current = true;
    void persist(gpsCoords);
  }, [picked, gpsCoords, persist]);

  const usingGps = !picked && gpsCoords !== null;

  return {
    location,
    selectLocation,
    /** GPS 모드로 전환 (저장된 위치를 지우고 GPS 기준으로 돌아감) */
    useCurrentLocation: useCallback(async () => {
      if (!gpsCoords) return;
      const selection = ++selectionRef.current;
      await persist(gpsCoords);
      if (selection !== selectionRef.current) return;
      clearStoredLocation();
      setPicked(false);
    }, [gpsCoords, persist]),
    /** 날씨 조회에 쓰는 기준 좌표 */
    coords: usingGps ? gpsCoords : (locationCoords(location) ?? DEFAULT_COORDS),
    /** 지금 보는 안내가 GPS 기준인지 — 안내 문구가 이걸로 갈린다 */
    usingGps,
    geoStatus,
    gpsCoords,
  };
}

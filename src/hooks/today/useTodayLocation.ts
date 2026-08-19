import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateUserLocation } from '../../api/location';
import {
  DEFAULT_LOCATION,
  getStoredLocation,
  locationCoords,
  setStoredLocation,
  type TodayLocation,
} from '../../lib/location';

/**
 * 오늘 탭이 어느 위치를 기준으로 안내할지.
 *
 * 위치가 **두 곳에 산다.** 날씨(`/environment/weather`)는 시·구 이름을 파라미터로 받으므로
 * 로컬 상태로 충분하지만, 브리핑(`/today/briefing`)은 파라미터가 `date` 하나뿐이라
 * 서버에 저장된 위치를 읽는다. 그래서 고른 값을 localStorage와 서버 양쪽에 남긴다.
 *
 * 순서가 중요하다 — **저장이 끝난 뒤에** 로컬 상태를 바꾼다.
 * 상태를 먼저 바꾸면 브리핑 쿼리 키가 곧바로 갈려서 저장 전 위치로 다시 받아 오고,
 * 화면에는 새 지역 이름 옆에 옛 지역 브리핑이 붙는다.
 */
export function useTodayLocation() {
  const [location, setLocation] = useState<TodayLocation>(
    () => getStoredLocation() ?? DEFAULT_LOCATION,
  );
  const queryClient = useQueryClient();

  const { mutateAsync: saveLocation, isPending } = useMutation({
    mutationFn: updateUserLocation,
  });

  const selectLocation = useCallback(
    async (next: TodayLocation) => {
      const coords = locationCoords(next);

      // 서버 저장이 실패해도 화면은 새 위치로 넘긴다. 날씨는 이름으로 부르니 그건 맞게 나오고,
      // 브리핑만 옛 기준으로 남는다 — 아무것도 안 바뀌는 것보다 낫다.
      if (coords) {
        try {
          await saveLocation(coords);
        } catch {
          // 인터셉터가 이미 ApiError로 정규화하고 401이면 로그인으로 보낸다. 여기서 더 할 일이 없다.
        }
      }

      setStoredLocation(next);
      setLocation(next);

      // 브리핑은 저장된 위치를 읽으므로, 키가 갈리는 것만으로는 부족하다 —
      // 같은 날짜를 다시 고르는 경우엔 키가 그대로라 캐시가 그대로 남는다.
      void queryClient.invalidateQueries({ queryKey: ['today', 'briefing'] });
    },
    [queryClient, saveLocation],
  );

  return { location, selectLocation, isSavingLocation: isPending };
}

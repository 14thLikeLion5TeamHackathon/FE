import { useQuery } from '@tanstack/react-query';

import { getWeather } from '../../api/weather';
import type { Coords } from '../../lib/location';

const weatherKeys = {
  /**
   * 좌표를 키에 그대로 쓰면 GPS가 미세하게 흔들릴 때마다 캐시가 갈린다.
   * 서버도 소수점 2자리(약 1.1km)로 반올림해 캐싱하므로 같은 단위로 맞춘다.
   */
  detail: (date: string, coords: Coords) =>
    ['weather', date, coords.latitude.toFixed(2), coords.longitude.toFixed(2)] as const,
};

/**
 * 기준 좌표의 날씨·환경 지표.
 *
 * `enabled`로 예보 범위 밖을 막는다 — 범위를 넘으면 서버가 400을 내는데,
 * 그건 오류가 아니라 "아직 예보가 없다"는 정상 상태다. 부르지 않는 편이 맞다.
 */
export function useWeather(date: string, coords: Coords, enabled = true) {
  return useQuery({
    queryKey: weatherKeys.detail(date, coords),
    queryFn: () => getWeather(coords, date),
    enabled,
  });
}

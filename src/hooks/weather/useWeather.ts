import { useQuery } from '@tanstack/react-query';

import { getWeather } from '../../api/weather';
import type { TodayLocation } from '../../lib/location';

const weatherKeys = {
  detail: (date: string, location: TodayLocation) =>
    ['weather', date, `${location.city}_${location.district}`] as const,
};

/**
 * 기준 위치의 날씨·환경 지표.
 *
 * `enabled`로 예보 범위 밖을 막는다 — 범위를 넘으면 서버가 400을 내는데,
 * 그건 오류가 아니라 "아직 예보가 없다"는 정상 상태다. 부르지 않는 편이 맞다.
 */
export function useWeather(date: string, location: TodayLocation, enabled = true) {
  return useQuery({
    queryKey: weatherKeys.detail(date, location),
    queryFn: () => getWeather(location, date),
    enabled,
  });
}

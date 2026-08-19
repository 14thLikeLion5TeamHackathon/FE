import type { Coords } from '../lib/location';
import { WeatherResponse, toWeather, type Weather } from '../types/weather';
import axiosInstance from './axiosInstance';

/**
 * 날씨·환경 지표를 브리핑과 따로 받는다.
 *
 * 값 자체는 브리핑 응답에 들어 있는 것과 같지만, 요청을 나눠 두면 한쪽이 실패해도
 * 다른 쪽은 보인다 — 브리핑이 죽어도 날씨는 뜨고, 그 반대도 된다.
 *
 * **좌표로 부른다.** 시·구 이름으로 부르면 서버가 자기 지역 표에서 좌표를 찾는데,
 * 표에 없는 지역은 에러 없이 서울 중구로 떨어진다. 좌표는 그 표를 거치지 않고
 * 그대로 예보 API에 실려 나가므로 전국이 정확하다.
 *
 * **응답에 공통 봉투가 없다.** 성공하면 본문이 그대로 오므로 `getResult`를 태우지 않는다.
 * 실패할 때만 봉투가 오는데, 그건 axios가 예외로 던져 인터셉터가 ApiError로 정규화한다.
 *
 * 예보 범위 밖 날짜는 400을 낸다("예보 제공 범위를 벗어난 날짜입니다").
 * 오늘 포함 5일까지만 온다 — 실서버로 확인했다(8/18 기준 8/22까지).
 */
export async function getWeather(coords: Coords, date?: string): Promise<Weather> {
  const res = await axiosInstance.get<unknown>('/api/v1/environment/weather', {
    params: {
      lat: coords.latitude,
      lon: coords.longitude,
      targetDate: date,
    },
  });
  return toWeather(WeatherResponse.parse(res.data));
}

import { z } from 'zod';

/**
 * 단건 날씨·환경 지표 (GET /api/v1/environment/weather).
 *
 * **이 엔드포인트만 공통 봉투를 쓰지 않는다** — 성공하면 본문을 그대로 준다.
 * 실패할 때만 `{success:false, code, message}` 봉투가 온다(실서버 확인).
 * 그래서 호출부에서 `getResult`를 태우면 안 된다.
 *
 * 숫자로 쓸 값이 문자열로 온다(`temperature: "28.07"`). 서버가 소수점을 문자열로
 * 내려주므로 경계에서 숫자로 바꿔 넘긴다 — 화면에서 `Math.round`를 쓰기 때문이다.
 */
export const WeatherResponse = z.object({
  targetDate: z.string().nullish(),
  city: z.string().nullish(),
  district: z.string().nullish(),
  /** "28.07" — 문자열로 온다 */
  temperature: z.string().nullish(),
  /** "구름조금" */
  weatherCondition: z.string().nullish(),
  /** "보통" — 지수가 아니라 등급 문자열이다 */
  uvIndex: z.string().nullish(),
  /** "좋음" */
  pm10Status: z.string().nullish(),
  pm10_value: z.number().nullish(),
});
export type WeatherResponse = z.infer<typeof WeatherResponse>;

/** 화면이 쓰는 형태. 기온만 숫자로 바꾸고 나머지는 등급 문자열 그대로 넘긴다. */
export type Weather = {
  temp: number | null;
  condition: string | null;
  uvLevel: string | null;
  dustLevel: string | null;
  dustValue: number | null;
};

export function toWeather(raw: WeatherResponse): Weather {
  const temp =
    raw.temperature === null || raw.temperature === undefined ? NaN : Number(raw.temperature);

  return {
    temp: Number.isNaN(temp) ? null : temp,
    condition: raw.weatherCondition ?? null,
    uvLevel: raw.uvIndex ?? null,
    dustLevel: raw.pm10Status ?? null,
    dustValue: raw.pm10_value ?? null,
  };
}

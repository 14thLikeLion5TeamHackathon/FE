import type { Coords } from '../lib/location';
import axiosInstance from './axiosInstance';
import type { ApiResponse } from './types';

/**
 * 기준 위치를 서버에 저장한다 (PATCH /api/v1/mypage/location).
 *
 * 브리핑이 위치를 **요청 파라미터로 받지 않게 바뀌면서** 생긴 엔드포인트다.
 * 예전에는 `/today/briefing?city=&district=`로 그때그때 실어 보냈는데, 지금 스펙의
 * 브리핑 파라미터는 `date` 하나뿐이다 — 서버가 저장된 위치를 읽는다.
 * 그래서 위치를 바꾸면 **먼저 이걸 보내고 나서** 브리핑을 다시 받아야 한다.
 *
 * 좌표만 받는다. 우리 화면은 시·구를 고르게 돼 있어서 `locationCoords`로 시 대표 좌표를 만들어 넘긴다
 * (그 한계는 `lib/location.ts`의 `CityEntry.coords` 주석 참고).
 *
 * 응답은 `ApiResponseVoid`라 꺼낼 값이 없다 — 성공 여부만 본다.
 */
export async function updateUserLocation(coords: Coords): Promise<void> {
  await axiosInstance.patch<ApiResponse>('/api/v1/mypage/location', coords);
}

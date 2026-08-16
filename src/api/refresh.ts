import axios from 'axios';

import { TokenRefreshResult } from '../types/auth';
import { getResult } from './helpers';
import type { ApiResponse } from './types';

/**
 * 액세스 토큰 갱신.
 *
 * 공용 axiosInstance를 쓰지 않는다 — 이 호출은 401 인터셉터가 부르는 것이라,
 * 같은 인스턴스를 타면 갱신 실패가 다시 갱신을 부르는 무한 루프가 된다.
 * 그래서 인터셉터가 없는 맨 axios로 보낸다.
 *
 * ⚠️ 문서상 "Refresh Token 인증 필요"인데 헤더인지 본문인지 불명확해 본문으로만 보낸다.
 */
export async function postTokenRefresh(refreshToken: string): Promise<TokenRefreshResult> {
  const res = await axios.post<ApiResponse>(
    `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/auth/token/refresh`,
    { refreshToken },
    { withCredentials: true, timeout: 10_000 },
  );
  return TokenRefreshResult.parse(getResult(res));
}

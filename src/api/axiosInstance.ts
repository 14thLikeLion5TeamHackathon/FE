import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { postTokenRefresh } from './refresh';
import { clearAccessToken, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from './token';
import { HttpStatus, type ApiError, type ApiResponse } from './types';
import { notifyUnauthorized } from './unauthorized';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  // 세션 쿠키 전송용. dev에서 쿠키 세션을 쓰면 vite.config.ts 프록시로 same-origin 처리.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** 요청 인터셉터 — Bearer JWT 주입 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

function toApiError(error: AxiosError<ApiResponse<unknown>>): ApiError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data;

  return {
    status,
    // BE가 주는 문자열 코드. 이름이 두 가지로 오갈 수 있어 둘 다 본다 (api/types.ts 참고).
    // 봉투가 없는 에러(게이트웨이·네트워크 실패)에서는 null이다.
    errorCode: body?.errorCode ?? body?.error_code ?? null,
    message: body?.message ?? error.message ?? '요청에 실패했습니다.',
    data: body?.data,
  };
}

/**
 * 갱신 요청은 한 번에 하나만 띄운다.
 *
 * 화면 하나가 API 서너 개를 동시에 부르는 게 보통이라, 토큰이 만료되면 401이 한꺼번에 터진다.
 * 각자 갱신을 부르면 리프레시 토큰이 회전하면서 서로의 토큰을 무효화해 전부 로그아웃된다.
 * 그래서 첫 요청이 만든 약속을 나머지가 같이 기다린다.
 */
let refreshing: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  refreshing ??= (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('no refresh token');

    const result = await postTokenRefresh(refreshToken);

    // 리프레시 토큰도 회전한다 — 새 값을 안 넣으면 다음 갱신에서 만료 판정을 받는다.
    if (result.refreshToken) setRefreshToken(result.refreshToken);
    setAccessToken(result.accessToken);
    return result.accessToken;
  })().finally(() => {
    refreshing = null;
  });

  return refreshing;
}

/** 이 요청으로 이미 갱신을 시도했는지. 실패한 갱신이 무한 재시도가 되지 않게 막는다. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/** 같은 순간에 몰린 401들이 로그아웃을 여러 번 실행하지 않게 막는다. */
let loggingOut = false;

/**
 * 응답 인터셉터
 * - 성공: AxiosResponse 그대로 반환 (본문은 ApiResponse<T>)
 * - 401: 토큰을 갱신해 한 번 재시도하고, 그래도 안 되면 로그인으로 보낸다
 * - 그 외 실패: 서버 에러 포맷을 ApiError로 정규화
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const apiError = toApiError(error);
    const config = error.config as RetriableConfig | undefined;

    // 판단 기준은 HTTP status 하나다. 봉투의 code는 number라 문자열 코드와 비교할 수 없고,
    // 봉투가 아예 없는 401(게이트웨이)도 있어서 status가 유일하게 항상 존재하는 신호다.
    if (apiError.status === HttpStatus.UNAUTHORIZED && config && !config._retried) {
      config._retried = true;

      try {
        // 이 요청이 들고 나간 토큰이 이미 낡았으면 갱신하지 않고 새 토큰으로 다시 쏜다.
        // 갱신이 끝난 직후 도착한 401까지 갱신을 부르면, 리프레시 토큰이 회전하는 서버에서
        // "직전 토큰 재사용"으로 탐지돼 전원 로그아웃이 될 수 있다.
        const sent = String(config.headers.Authorization ?? '').replace('Bearer ', '');
        const current = getAccessToken();
        const accessToken = sent && current && sent !== current ? current : await refreshAccessToken();

        config.headers.Authorization = `Bearer ${accessToken}`;
        return await axiosInstance(config);
      } catch (refreshError) {
        // 네트워크 장애로 갱신이 실패한 것뿐이면 토큰을 지우지 않는다 —
        // 멀쩡한 리프레시 토큰을 버리고 재로그인을 강요하게 된다.
        const status = (refreshError as { response?: { status?: number } })?.response?.status;
        if (status !== undefined && status !== HttpStatus.UNAUTHORIZED && status !== HttpStatus.FORBIDDEN) {
          return Promise.reject(apiError);
        }
      }
    }

    if (apiError.status === HttpStatus.UNAUTHORIZED) {
      // 화면 하나가 API를 여럿 부르면 401도 한꺼번에 터진다. 로그아웃은 한 번만 돈다.
      if (!loggingOut) {
        loggingOut = true;
        clearAccessToken();
        notifyUnauthorized();
        queueMicrotask(() => {
          loggingOut = false;
        });
      }
    }

    return Promise.reject(apiError);
  },
);

export default axiosInstance;

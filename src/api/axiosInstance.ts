import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { clearAccessToken, getAccessToken } from './token';
import { ErrorCode, type ApiError, type ApiResponse } from './types';
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
    code: body?.code ?? (status === 0 ? 'NETWORK_ERROR' : ErrorCode.INTERNAL_SERVER_ERROR),
    message: body?.message ?? error.message ?? '요청에 실패했습니다.',
    result: body?.result,
  };
}

/**
 * 응답 인터셉터
 * - 성공: AxiosResponse 그대로 반환 (본문은 ApiResponse<T>)
 * - 실패: 서버 에러 포맷을 ApiError로 정규화
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const apiError = toApiError(error);

    // 401 — 토큰 무효. 지우고 로그인으로 돌려보낸다.
    // status와 code 둘 다 본다: 게이트웨이가 만든 401은 code가 없고, code만 오는 경우도 있다.
    if (apiError.status === 401 || apiError.code === ErrorCode.UNAUTHORIZED) {
      clearAccessToken();
      notifyUnauthorized();
    }

    return Promise.reject(apiError);
  },
);

export default axiosInstance;

import type { AxiosResponse } from 'axios';

import type { ApiResponse } from './types';

/** Axios 응답에서 봉투를 벗기고 ApiResponse.data만 꺼냄 */
export function getResult<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data as T;
}

/** Axios 응답의 ApiResponse 전체 */
export function getApiBody<T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
  return response.data;
}

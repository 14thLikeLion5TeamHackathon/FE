/**
 * BE 공통 응답 봉투 (docs/api-contract.md "기본 사항").
 * 실제 응답: { success, code: number, errorCode: string|null, message, data }
 * 단 `/api/v1/environment/weather`만 봉투 없이 본문을 그대로 준다.
 */
export type ApiResponse<T = unknown> = {
  success: boolean;
  code: number;
  errorCode: string | null;
  message: string;
  data: T;
};

/**
 * 인터셉터가 정규화한 에러. 컴포넌트는 axios 에러 형태를 몰라도 된다.
 * 분기는 HTTP `status`로 한다 — 봉투의 `code`는 number라 문자열 코드와 비교할 수 없고,
 * 게이트웨이가 만든 에러에는 봉투 자체가 없다. `errorCode`는 로깅·세부 분기용으로 보존만 한다.
 */
export type ApiError = {
  status: number;
  errorCode: string | null;
  message: string;
  data?: unknown;
};

// erasableSyntaxOnly 때문에 enum 대신 const 객체를 쓴다.
export const HttpStatus = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * BE 공통 응답 봉투: { success, code: number, message, data }
 *
 * 세부 에러 코드의 이름이 셋으로 갈린다 — 스웨거 스키마는 `errorCode`, BE 문서 예시는 `error_code`,
 * 실제 401 응답에는 아예 없다. 어느 쪽이 오든 읽히도록 셋 다 선택적으로 둔다.
 * 화면 분기는 HTTP status로 하니 이 값이 비어도 동작에는 지장이 없다.
 *
 * 단 `/api/v1/environment/weather`만 봉투 없이 본문을 그대로 준다.
 */
export type ApiResponse<T = unknown> = {
  success: boolean;
  code: number;
  errorCode?: string | null;
  error_code?: string | null;
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

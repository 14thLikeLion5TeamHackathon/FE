/** BE 공통 응답 봉투. 실제 계약 확정되면 필드명만 맞출 것. */
export type ApiResponse<T = unknown> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

/** 인터셉터가 정규화한 에러. 컴포넌트는 axios 에러 형태를 몰라도 된다. */
export type ApiError = {
  status: number;
  code: string;
  message: string;
  result?: unknown;
};

// erasableSyntaxOnly 때문에 enum 대신 const 객체를 쓴다.
export const ErrorCode = {
  UNAUTHORIZED: 'COMMON401',
  FORBIDDEN: 'COMMON403',
  NOT_FOUND: 'COMMON404',
  INTERNAL_SERVER_ERROR: 'COMMON500',
} as const;

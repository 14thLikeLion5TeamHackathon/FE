import { z } from 'zod';

/**
 * 로그아웃 응답의 data. 계약상 본문이 비어 있어(`data: null`) 검증할 형태가 없지만,
 * API 함수는 `.parse()`로 끝낸다는 규칙은 지킨다 — 무엇이 오든 결과는 null로 고정.
 */
export const LogoutResult = z.unknown().transform(() => null);
export type LogoutResult = z.infer<typeof LogoutResult>;

/**
 * 토큰 갱신 응답. 리프레시 토큰도 함께 새로 내려온다(회전) — 반드시 갈아끼워야 한다.
 * 예전 것을 그대로 두면 다음 갱신에서 만료 판정을 받는다.
 */
export const TokenRefreshResult = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().nullish(),
  })
  .passthrough()
  .transform((data) => ({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? null,
  }));
export type TokenRefreshResult = z.infer<typeof TokenRefreshResult>;

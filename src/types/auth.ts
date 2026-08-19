import { z } from 'zod';

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

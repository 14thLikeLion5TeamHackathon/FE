import { z } from 'zod';

/**
 * BE 계약이 아직 없어서 화면 개발용으로 둔 임시 스키마다.
 * 실 OAuth가 붙으면 토큰 교환 응답 형태에 맞춰 이 파일부터 고친다.
 */
export const LoginResult = z.object({
  accessToken: z.string(),
});
export type LoginResult = z.infer<typeof LoginResult>;

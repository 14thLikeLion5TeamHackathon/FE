import { z } from 'zod';

/**
 * 로그아웃 응답의 data. 계약상 본문이 비어 있어(`data: null`) 검증할 형태가 없지만,
 * API 함수는 `.parse()`로 끝낸다는 규칙은 지킨다 — 무엇이 오든 결과는 null로 고정.
 */
export const LogoutResult = z.unknown().transform(() => null);
export type LogoutResult = z.infer<typeof LogoutResult>;

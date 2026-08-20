import { z } from 'zod';

/**
 * 카카오톡 알림 수신 동의.
 *
 * 스웨거의 `KakaoNotificationResponse`에는 required가 하나도 없다 — 어느 필드든
 * 빠지거나 null로 올 수 있다. 여기서 파싱이 터지면 **서버에는 동의가 반영됐는데**
 * 화면만 실패로 보인다(types/schedule.ts에서 이미 겪은 사고다). 전부 느슨하게 받는다.
 */
export const KakaoNotificationResponse = z.object({
  notificationId: z.number().nullish(),
  userId: z.number().nullish(),
  consent: z.boolean().nullish(),
  /** ISO date-time */
  consentedAt: z.string().nullish(),
  /** 연동 자체가 살아 있는지. 수신 동의(consent)와 다른 값이다 */
  connected: z.boolean().nullish(),
});
export type KakaoNotificationResponse = z.infer<typeof KakaoNotificationResponse>;

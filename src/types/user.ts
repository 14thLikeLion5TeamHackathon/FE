import { z } from 'zod';

/* ── 공통 ─────────────────────────────────────────────────── */

export const Gender = z.enum(['FEMALE', 'MALE']);
export type Gender = z.infer<typeof Gender>;

/** 화면 표시용 한글 라벨 */
export const GENDER_LABEL: Record<Gender, string> = {
  FEMALE: '여자',
  MALE: '남자',
};

/* ── POST /api/v1/auth/onboarding — 온보딩/회원정보등록 ───── */

/**
 * 소셜 로그인 직후 한 번 보내는 회원정보.
 *
 * `gender`와 `agreeCalendarData`는 서버에서 선택값이다 — 화면에서도 건너뛸 수 있다.
 * `birthDate`는 **하이픈** 포맷("2007-05-17")이다. 화면 상태는 점("2007.05.17")이라
 * 보내기 직전에 `toDateInputValue`로 바꾼다.
 */
export const OnboardingRequest = z.object({
  name: z.string(),
  birthDate: z.string(),
  gender: Gender.optional(),
  agreePersonalInfo: z.boolean(),
  agreeHealthData: z.boolean(),
  agreeCalendarData: z.boolean().optional(),
  hasAacOfflineExperience: z.boolean(),
});
export type OnboardingRequest = z.infer<typeof OnboardingRequest>;

export const OnboardingResponse = z.object({
  userId: z.number(),
  name: z.string(),
  /** 이번 요청으로 계정이 새로 만들어졌는지. 로그인 리다이렉트의 같은 이름 파라미터와 짝이다 */
  isNewUser: z.boolean().nullish(),
  createdAt: z.string().nullish(),
});
export type OnboardingResponse = z.infer<typeof OnboardingResponse>;

/* ── GET /api/v1/mypage/users/me — 개인정보 조회 ──────────── */

export const MyProfile = z.object({
  userId: z.number(),
  name: z.string().nullable(),
  birthDate: z.string().nullable(),
  gender: z.string().nullable(),
  hasAacOfflineExperience: z.boolean().nullable(),
  agreePersonalInfo: z.boolean().nullable(),
  agreeHealthData: z.boolean().nullable(),
  agreeCalendarData: z.boolean().nullable(),
});
export type MyProfile = z.infer<typeof MyProfile>;

/* ── PUT /api/v1/mypage/users/me — 개인정보 수정 ──────────── */

export const UpdateProfileRequest = z.object({
  name: z.string(),
  birthDate: z.string(),
  gender: z.string(),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequest>;

export const UserIdResponse = z.object({
  userId: z.number(),
});
export type UserIdResponse = z.infer<typeof UserIdResponse>;

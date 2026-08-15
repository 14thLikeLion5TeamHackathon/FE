import { z } from 'zod';

/* ── 공통 ─────────────────────────────────────────────────── */

export const Gender = z.enum(['FEMALE', 'MALE']);
export type Gender = z.infer<typeof Gender>;

/** 화면 표시용 한글 라벨 */
export const GENDER_LABEL: Record<Gender, string> = {
  FEMALE: '여자',
  MALE: '남자',
};

/* ── GET /api/v1/mypage/users/me — 개인정보 조회 ──────────── */

export const MyProfile = z.object({
  userId: z.number(),
  name: z.string(),
  birthDate: z.string(), // "2026-08-15"
  gender: z.string(),
  hasAacOfflineExperience: z.boolean(),
  agreePersonalInfo: z.boolean(),
  agreeHealthData: z.boolean(),
  agreeCalendarData: z.boolean(),
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

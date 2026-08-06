import { z } from 'zod';

/**
 * BE 계약이 아직 없어서 시안에서 역산한 임시 스키마다.
 * 계약이 오면 이 파일만 고치면 되고, 타입 에러가 난 지점이 곧 수정 대상이다.
 */

export const Gender = z.enum(['FEMALE', 'MALE']);
export type Gender = z.infer<typeof Gender>;

/** 마이 > 알림 설정. all을 끄면 나머지 셋은 발송되지 않는다. */
export const NotificationSettings = z.object({
  all: z.boolean(),
  dailyCare: z.boolean(),
  recordReminder: z.boolean(),
  preWarning: z.boolean(),
});
export type NotificationSettings = z.infer<typeof NotificationSettings>;

export const MyProfile = z.object({
  name: z.string(),
  /** YYYY.MM.DD */
  birthDate: z.string(),
  gender: Gender,
  /** 연동된 Google 계정. 미연동이면 null */
  calendarEmail: z.string().nullable(),
  notifications: NotificationSettings,
});
export type MyProfile = z.infer<typeof MyProfile>;

/** 화면 표시용 한글 라벨. 시안 회원가입의 세그먼트와 용어를 맞춘다. */
export const GENDER_LABEL: Record<Gender, string> = {
  FEMALE: '여자',
  MALE: '남자',
};

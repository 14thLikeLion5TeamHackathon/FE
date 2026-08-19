import { SymptomKey, normalizeDday } from './common';
import { AiFeedback } from './card';
import { z } from 'zod';

/**
 * 상태 태그 (목록 조회용).
 *
 * 실서버는 증상 4종을 준다 — `{tagId: 1, name: "붉은기", code: "redness"}`.
 * `code`가 기록 등록이 보내는 강도 맵의 키와 같은 값이라, 이걸로 화면 목록을 만든다.
 */
export const StatusTag = z.object({
  /** 목록 key. 없으면 항목을 그릴 수가 없으니 필수로 남긴다 */
  tagId: z.number(),
  /** 스웨거에 required가 없다. 라벨 하나 비었다고 증상 목록 전체가 사라지면 안 된다 */
  name: z.string().nullish(),
  code: z.string().nullish(),
});
export type StatusTag = z.infer<typeof StatusTag>;

/**
 * 서버가 증상 강도를 담을 때 쓰는 키.
 * 화면 상수(SymptomKey)는 대문자라 철자가 다르다 — 계약 경계에서만 이 맵으로 옮긴다.
 */
export const SYMPTOM_TAG_KEY: Record<SymptomKey, string> = {
  REDNESS: 'redness',
  SWELLING: 'swelling',
  PAIN: 'pain',
  DRYNESS: 'dryness',
};

/**
 * 서버 `code` → 화면 상수. 모르는 코드는 null이라 호출부가 걸러낸다.
 *
 * 화면이 아는 증상만 받는다 — 서버가 새 태그를 추가해도 강도 UI(0~3)와 라벨이 없어서
 * 그냥 그리면 빈 칸이 뜬다. 목록에서 빠지는 편이 낫고, 그때 이 표에 한 줄을 더한다.
 */
export function toSymptomKey(code: string | null | undefined): SymptomKey | null {
  const entry = (Object.keys(SYMPTOM_TAG_KEY) as SymptomKey[]).find(
    (key) => SYMPTOM_TAG_KEY[key] === code,
  );
  return entry ?? null;
}

/**
 * 등록 응답의 tags. 스웨거가 `additionalProperties: integer`라 키를 4종으로 못 박지 않는다.
 * 여기서 키를 고정하면 서버가 증상을 하나 늘리는 순간 파싱이 터진다.
 */
export const RecordTagMap = z.record(z.string(), z.number().int());
export type RecordTagMap = z.infer<typeof RecordTagMap>;

/**
 * 기록 생성 요청 — multipart/form-data로 전송. cardId는 path parameter.
 * POST /api/v1/now/care-cards/{cardId}/records
 *
 * photos는 서버의 `photo` 필드에 같은 키로 여러 번 append해서 배열로 만든다.
 * tags는 `{"redness":3,"swelling":0,...}`을 JSON 문자열로 직렬화한 값이다.
 */
export const CreateRecordRequest = z.object({
  photos: z.array(z.instanceof(File)).min(1),
  statusDescription: z.string(),
  tags: z.string(),
});
export type CreateRecordRequest = z.infer<typeof CreateRecordRequest>;

/* ── 기록 응답이 두 벌인 이유 ──────────────────────────────
 * 같은 기록인데 서버가 형태를 다르게 준다.
 *   등록 응답(CareRecordResponse)   : tags가 `{ redness: 3, ... }` 객체
 *   타임라인(CareRecordTimelineItem): redness/swelling/pain/dryness가 평평한 개별 필드
 * 한 타입으로 억지로 합치면 어느 쪽이든 `.parse()`가 터지므로 계약대로 나눠 둔다.
 * BE가 형태를 통일하면 그때 한 벌로 줄인다.
 * ─────────────────────────────────────────────────────── */

/**
 * 기록 등록 응답 (POST /api/v1/now/care-cards/{cardId}/records)
 *
 * **`recordId` 말고는 전부 선택으로 둔다.** 화면이 쓰는 건 그 값 하나뿐인데(등록 직후
 * 피드백 화면으로 이동), 나머지를 필수로 잡았다가 하나만 어긋나도 `.parse()`가 터진다.
 * 그러면 서버에는 기록이 **저장된 채로** 화면은 안 넘어가고, 사용자는 실패한 줄 알고
 * 다시 눌러 같은 기록을 두 번 만든다 — 실제로 그렇게 됐다(dday를 필수로 잡았는데
 * 서버가 `dDay`로 줬다).
 */
export const CreateRecordResponse = z.preprocess(
  normalizeDday,
  z.object({
    recordId: z.number(),
    cardId: z.number().nullish(),
    photoUrls: z.array(z.string()).nullish(),
    statusDescription: z.string().nullish(),
    recordedAt: z.string().nullish(),
    tags: RecordTagMap.nullish(),
    dday: z.number().nullish(),
  }),
);
export type CreateRecordResponse = z.infer<typeof CreateRecordResponse>;

/**
 * 타임라인의 증상 강도.
 *
 * 스웨거는 넷 다 **선택이고 상한도 없는 int32**다. 화면 상수(`Intensity` = 0~3)를 그대로
 * 쓰면 하나만 빠지거나 4 이상이 오는 순간 회복 타임라인·회복 곡선이 통째로 빈 화면이 된다.
 *
 * 범위를 벗어난 값은 **버리지 않고 0~3으로 접는다.** 곡선은 점 하나가 빠지면 흐름이 끊기는데,
 * 접어 두면 "더 심함/덜 심함"이라는 순서는 살아남는다.
 * 값이 아예 없으면 `null`이다 — 0으로 채우면 사용자가 "없음"이라고 답한 것처럼 보인다.
 * 그 판단(태그를 감출지, 곡선에서 건너뛸지)은 호출부가 한다.
 */
const TimelineIntensity = z
  .number()
  .transform((value) => Math.min(3, Math.max(0, Math.round(value))))
  .nullish()
  .catch(null);

/** 타임라인 기록 항목 (GET /api/v1/cards/{cardId}/records) */
export const RecordTimelineItem = z.preprocess(
  // 타임라인도 D-day를 `dDay`로 준다 — 카드와 같은 사정이다(types/common.ts 참고)
  normalizeDday,
  z.object({
    /** 목록 key이자 곡선 점의 정체다. 없으면 그 기록으로 할 수 있는 게 없어 필수로 남긴다 */
    recordId: z.number(),
    /** 스웨거에 required가 없다. 날짜 하나 때문에 타임라인 전체를 잃지 않는다 */
    recordedAt: z.string().nullish(),
    photoUrls: z.array(z.string()).nullish(),
    statusDescription: z.string().nullish(),
    redness: TimelineIntensity,
    swelling: TimelineIntensity,
    pain: TimelineIntensity,
    dryness: TimelineIntensity,
    /**
     * 피드백은 **기록과 같이 만들어지지 않는다** — 조회해서 없으면 그때 만든다
     * (`api/feedback.ts` 참고). 즉 피드백이 없는 기록이 정상 상태인데, `.nullable()`은
     * 키 누락을 허용하지 않아 그 정상 상태에서 파싱이 터졌다.
     */
    aiFeedback: AiFeedback.nullish(),
    /** 위의 normalizeDday가 항상 숫자로 만들어 내보내므로 여기만 필수로 둔다 */
    dday: z.number(),
  }),
);
export type RecordTimelineItem = z.infer<typeof RecordTimelineItem>;

/**
 * 스웨거에 required가 없다. 화면이 읽는 건 `careRecords` 하나뿐이고 `cardId`는 이미
 * 요청할 때 알고 있는 값이라, 봉투 때문에 타임라인을 통째로 잃을 이유가 없다.
 */
export const RecordTimelineResponse = z.object({
  cardId: z.number().nullish(),
  careRecords: z.array(RecordTimelineItem).nullish(),
});
export type RecordTimelineResponse = z.infer<typeof RecordTimelineResponse>;

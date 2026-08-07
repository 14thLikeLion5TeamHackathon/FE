import { z } from 'zod';

/**
 * 여러 도메인이 공유하는 값들.
 * BE 계약이 오면 이 파일부터 맞춘다 — 여기가 바뀌면 도메인 전체가 따라 움직인다.
 */

/** 환경 지표 위험도. 색만으로 구분하지 않도록 화면에서 값 텍스트를 함께 노출한다. */
export const Level = z.enum(['LOW', 'MODERATE', 'HIGH', 'SEVERE']);
export type Level = z.infer<typeof Level>;

export const LEVEL_LABEL: Record<Level, string> = {
  LOW: '좋음',
  MODERATE: '보통',
  HIGH: '나쁨',
  SEVERE: '매우 나쁨',
};

/** 기록하는 증상 4종. 회복 곡선과 AI 피드백 비교가 같은 키를 쓴다. */
export const SymptomKey = z.enum(['SWELLING', 'PAIN', 'REDNESS', 'DRYNESS']);
export type SymptomKey = z.infer<typeof SymptomKey>;

export const SYMPTOM_LABEL: Record<SymptomKey, string> = {
  SWELLING: '부기',
  PAIN: '통증',
  REDNESS: '붉은기',
  DRYNESS: '건조함',
};

/** 증상 강도 0~3. 사용자가 직접 매기므로 AI가 덮어쓰지 않는다. */
export const Intensity = z.number().int().min(0).max(3);
export type Intensity = z.infer<typeof Intensity>;

export const INTENSITY_LABEL = ['없음', '약간', '보통', '심함'] as const;

/**
 * 증상 변화 방향.
 * 색만으로 구분하면 안 되므로 화면에서 `↓ ↑ –` 기호를 함께 쓴다.
 * DOWN = 강도가 내려감(좋아짐), UP = 올라감(나빠짐)
 */
export const Trend = z.enum(['DOWN', 'SAME', 'UP']);
export type Trend = z.infer<typeof Trend>;

/** AI가 판단에 사용한 요소를 화면에 칩으로 보여준다. */
export const EvidenceChip = z.object({
  label: z.string(),
});
export type EvidenceChip = z.infer<typeof EvidenceChip>;

import { SYMPTOM_LABEL, type SymptomKey } from '../../../types/common';
import type { RecoveryPoint } from '../../../types/recovery';

/** 패널 좌표계. viewBox로 그리고 폭은 CSS가 정한다. */
const VIEW_W = 159;
const VIEW_H = 46;
const X0 = 4;
const X1 = VIEW_W - 4;

/** 강도 0~3 → y. 위로 갈수록 심함. */
const toY = (intensity: number) => 40 - intensity * 12;

const SYMPTOMS: SymptomKey[] = ['SWELLING', 'PAIN', 'REDNESS', 'DRYNESS'];

type SymptomChartProps = {
  points: RecoveryPoint[];
};

/**
 * 증상 4종 시계열.
 *
 * 한 차트에 4개 선을 겹치지 않고 **2×2 스몰 멀티플**로 나눈다.
 * 모바일 폭에서 4개가 겹치면 색으로만 구분해야 하는데, 패널마다 증상명을 직접 라벨하면
 * 색 의존이 사라지고 단일 색(primary)만 써도 된다.
 *
 * x축은 기록 수에 맞춰 늘어난다 — 3점 고정이 아니다.
 */
export default function SymptomChart({ points }: SymptomChartProps) {
  const count = points.length;
  const x = (index: number) => (count === 1 ? X0 : X0 + ((X1 - X0) * index) / (count - 1));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {SYMPTOMS.map((key) => {
          const values = points.map(
            (point) => point.symptoms.find((s) => s.key === key)?.intensity ?? 0,
          );
          const path = values
            .map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${toY(v)}`)
            .join(' ');
          const lastIndex = values.length - 1;

          return (
            <div key={key} className="flex flex-col gap-1">
              <span className="typo-caption text-text-secondary">{SYMPTOM_LABEL[key]}</span>
              <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="w-full"
                role="img"
                aria-label={`${SYMPTOM_LABEL[key]} 강도 변화: ${values.join(', ')}`}
              >
                <path
                  d={path}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* 마지막 점 = 최근 기록 */}
                <circle
                  cx={x(lastIndex)}
                  cy={toY(values[lastIndex])}
                  r="3.5"
                  fill="var(--color-primary)"
                />
              </svg>
            </div>
          );
        })}
      </div>
      <p className="typo-caption text-text-tertiary">위로 갈수록 심함 · 0~3 · 점은 최근 기록</p>
    </div>
  );
}

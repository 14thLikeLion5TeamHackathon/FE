import { cn } from '../../../lib/cn';
import type { Level } from '../../../types/common';

const DOT_COLOR: Record<Level, string> = {
  LOW: 'bg-level-low',
  MODERATE: 'bg-level-moderate',
  HIGH: 'bg-level-high',
  SEVERE: 'bg-level-severe',
};

type EnvMetricProps = {
  label: string;
  value: string;
  level: Level;
};

/**
 * 자외선·미세먼지·습도.
 * **색만으로 구분되지 않게 값 텍스트를 항상 함께 노출한다** — 색각 이상 대응이자 시안 규칙.
 */
export default function EnvMetric({ label, value, level }: EnvMetricProps) {
  return (
    <div className="bg-surface-elevated rounded-sm flex flex-1 flex-col items-center gap-1 p-2.5">
      <span className="typo-caption text-text-secondary">{label}</span>
      <span className="flex items-center gap-1">
        <span className={cn('size-1.5 rounded-full', DOT_COLOR[level])} aria-hidden />
        <span className="typo-body text-text-primary">{value}</span>
      </span>
    </div>
  );
}

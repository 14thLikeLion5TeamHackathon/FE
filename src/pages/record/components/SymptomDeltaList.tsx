import { cn } from '../../../lib/cn';
import { INTENSITY_LABEL, SYMPTOM_LABEL, type Trend } from '../../../types/common';
import type { SymptomDelta } from '../../../types/feedback';

/**
 * 방향 표기.
 *
 * **색만으로 구분하지 않는다.** 화살표는 강도가 오르내린 사실만 말하고(중립),
 * 좋고 나쁨은 색이 거든다. 둘 중 하나만 봐도 읽히게 이중으로 건다.
 */
const TREND: Record<Trend, { glyph: string; color: string; label: string }> = {
  DOWN: { glyph: '↓', color: 'text-level-low', label: '좋아짐' },
  UP: { glyph: '↑', color: 'text-level-high', label: '나빠짐' },
  SAME: { glyph: '–', color: 'text-text-tertiary', label: '그대로' },
};

type SymptomDeltaListProps = {
  deltas: SymptomDelta[];
};

export default function SymptomDeltaList({ deltas }: SymptomDeltaListProps) {
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {deltas.map((delta) => {
          const trend = TREND[delta.trend];
          return (
            <li key={delta.key} className="flex items-center justify-between">
              <span className="typo-body text-text-secondary">{SYMPTOM_LABEL[delta.key]}</span>
              <span className={cn('typo-body flex items-center gap-1.5', trend.color)}>
                <span aria-hidden>{trend.glyph}</span>
                <span>
                  {INTENSITY_LABEL[delta.before]} → {INTENSITY_LABEL[delta.after]}
                </span>
                {/* 화면에는 기호로 충분하지만 읽어 줄 때는 말이 필요하다 */}
                <span className="sr-only">{trend.label}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="typo-caption text-text-tertiary">↓ 강도 내려감 · ↑ 올라감 · – 그대로</p>
    </div>
  );
}

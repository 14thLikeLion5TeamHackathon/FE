import Chip from '../../../components/Chip';
import type { Level } from '../../../types/common';
import EnvMetric from './EnvMetric';

type CareEvidenceProps = {
  /**
   * 블록 제목. 기본값은 브리핑 아래에 붙을 때 쓰는 "이렇게 안내한 이유"다.
   * 카드가 없어 안내할 판단 자체가 없는 화면에서는 근거가 아니라 정보라서 제목이 달라야 한다.
   */
  title?: string;
  metrics: { label: string; value: string; level: Level }[];
  evidence: { label: string }[];
};

/**
 * 브리핑의 근거 블록.
 * 결론(CareBriefing)과 분리해 아래에 둔다 — 사용자는 결론을 먼저 보고, 궁금하면 근거를 본다.
 *
 * 일정은 여기 있다가 `TodaySchedules`로 빠졌다 — 읽는 자리에 편집 기능을 숨겨두면
 * 수정·삭제에 닿을 방법이 없다(그 컴포넌트 주석 참고).
 */
export default function CareEvidence({
  title = '이렇게 안내한 이유',
  metrics,
  evidence,
}: CareEvidenceProps) {
  return (
    <section className="bg-surface-raised rounded-md flex flex-col gap-2.5 p-4">
      <h2 className="typo-label text-text-tertiary">{title}</h2>

      <div className="flex gap-2">
        {metrics.map((metric) => (
          <EnvMetric key={metric.label} {...metric} />
        ))}
      </div>

      {evidence.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {evidence.map((chip) => (
            <Chip key={chip.label}>{chip.label}</Chip>
          ))}
        </div>
      )}
    </section>
  );
}

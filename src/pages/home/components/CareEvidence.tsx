import { useState } from 'react';

import Chip from '../../../components/Chip';
import { cn } from '../../../lib/cn';
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
  schedules: { id: number; title: string; time: string | null; place: string | null }[];
};

/**
 * 브리핑의 근거 블록.
 * 결론(CareBriefing)과 분리해 아래에 둔다 — 사용자는 결론을 먼저 보고, 궁금하면 근거를 본다.
 * 일정 목록은 건수만 접어서 보여주고 펼치면 시간·제목이 나온다.
 */
export default function CareEvidence({
  title = '이렇게 안내한 이유',
  metrics,
  evidence,
  schedules,
}: CareEvidenceProps) {
  const [expanded, setExpanded] = useState(false);

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

      {schedules.length > 0 && (
        <>
          <div className="bg-border-subtle h-px w-full" aria-hidden />
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="flex items-center justify-between"
          >
            <span className="typo-caption text-text-secondary">오늘 일정 {schedules.length}건</span>
            <span
              className={cn(
                'typo-caption text-text-tertiary transition-transform',
                expanded && 'rotate-180',
              )}
              aria-hidden
            >
              ⌄
            </span>
          </button>

          {expanded && (
            <ul className="flex flex-col gap-2">
              {schedules.map((schedule) => (
                <li key={schedule.id} className="flex items-center gap-2">
                  <span className="typo-caption text-text-tertiary w-16 shrink-0">
                    {schedule.time ?? '종일'}
                  </span>
                  <span className="typo-caption text-text-secondary flex-1">{schedule.title}</span>
                  {schedule.place && (
                    <span className="typo-caption text-text-tertiary">{schedule.place}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

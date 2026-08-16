import { useState } from 'react';

import Chip from '../../../components/Chip';
import { cn } from '../../../lib/cn';
import type { Level } from '../../../types/common';
import EnvMetric from './EnvMetric';

type CareEvidenceProps = {
  metrics: { label: string; value: string; level: Level }[];
  evidence: { label: string }[];
  schedules: { id: number; title: string; time: string | null; place: string | null }[];
};

/**
 * 브리핑의 근거 블록.
 * 결론(CareBriefing)과 분리해 아래에 둔다 — 사용자는 결론을 먼저 보고, 궁금하면 근거를 본다.
 * 일정 목록은 건수만 접어서 보여주고 펼치면 시간·제목이 나온다.
 */
export default function CareEvidence({ metrics, evidence, schedules }: CareEvidenceProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="bg-surface-raised rounded-md flex flex-col gap-2.5 p-4">
      <h2 className="typo-label text-text-tertiary">이렇게 안내한 이유</h2>

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

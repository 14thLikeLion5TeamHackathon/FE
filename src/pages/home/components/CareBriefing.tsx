import type { TodayBriefing } from '../../../types/today';

type CareBriefingProps = Pick<TodayBriefing, 'dateLabel' | 'weather' | 'message'>;

/**
 * 결론 문구.
 * 근거(환경지표·칩·일정)는 CareEvidence로 분리했다 — 왜 → 무엇 → 근거 순서를 지키기 위함.
 */
export default function CareBriefing({ dateLabel, weather, message }: CareBriefingProps) {
  return (
    <section className="bg-surface-raised rounded-md flex flex-col gap-2.5 p-4">
      <header className="flex items-baseline justify-between">
        <h2 className="typo-card-title">{dateLabel}</h2>
        {weather && <span className="typo-label text-text-secondary">{weather}</span>}
      </header>
      <p className="typo-body text-text-primary">{message}</p>
    </section>
  );
}

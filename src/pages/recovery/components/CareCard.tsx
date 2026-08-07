import Button from '../../../components/Button';
import Chip from '../../../components/Chip';
import { cn } from '../../../lib/cn';
import type { CareCard as CareCardData } from '../../../types/card';

type CareCardProps = {
  card: CareCardData;
  onDetail: () => void;
  onRecord: () => void;
};

/**
 * 케어 카드 — 회복 여정 하나.
 *
 * 완료된 카드는 **`상태 기록` 버튼을 감춘다.** 회복이 끝났는데 기록 버튼이 있으면
 * 무엇을 더 해야 하는 것처럼 읽힌다.
 */
export default function CareCard({ card, onDetail, onRecord }: CareCardProps) {
  const done = card.status === 'DONE';
  const progress = Math.min(100, (card.dday / card.totalDays) * 100);

  return (
    <article
      className={cn(
        'bg-surface-raised border-border-subtle rounded-md flex flex-col gap-4 border p-4',
        done && 'opacity-60',
      )}
    >
      <div className="flex flex-col gap-2.5">
        <header className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="typo-card-title">{card.name}</h3>
            <p className="typo-caption text-text-secondary">시술일 {card.treatedAt}</p>
          </div>
          <Chip>D+{card.dday}</Chip>
        </header>

        <div className="flex flex-col gap-1">
          <div className="bg-border-subtle rounded-bar h-1.5 w-full" aria-hidden>
            <div className="bg-primary rounded-bar h-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="typo-caption text-text-secondary">회복 진행</span>
            <span className="typo-caption text-text-secondary">
              {card.dday} / {card.totalDays}일
            </span>
          </div>
        </div>

        <div className="bg-border-subtle h-px w-full" aria-hidden />

        <div className="flex flex-col gap-1">
          <p className="typo-label text-text-primary">오늘의 케어</p>
          <p className="typo-body text-text-secondary">{card.todayCare}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onDetail}>카드 상세</Button>
        {!done && (
          <Button variant="secondary" onClick={onRecord}>
            {card.recordRecommended ? `D+${card.dday} 기록하기` : '상태 기록'}
          </Button>
        )}
      </div>
    </article>
  );
}

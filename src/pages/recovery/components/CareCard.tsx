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
  const progress = Math.min(100, (card.dday / card.recoveryTotalDays) * 100);

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
            <h3 className="typo-card-title">{card.treatmentName}</h3>
            <p className="typo-caption text-text-secondary">시술일 {card.treatmentDate}</p>
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
              {done ? '완료' : `${card.dday} / ${card.recoveryTotalDays}일`}
            </span>
          </div>
        </div>

        <div className="bg-border-subtle h-px w-full" aria-hidden />

        <div className="flex flex-col gap-1">
          {/* 목록 응답에는 오늘의 케어 안내가 없다(그건 카드 상세의 todayCare다).
              여기 있는 건 사용자가 마지막 기록에 쓴 상태 메모라 라벨을 그에 맞춘다. */}
          <p className="typo-label text-text-primary">최근 기록</p>
          <p className="typo-body text-text-secondary">
            {card.statusDescription ?? '등록된 기록이 없어요'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onDetail}>카드 상세</Button>
        {!done && (
          <Button variant="secondary" onClick={onRecord}>
            상태 기록
          </Button>
        )}
      </div>
    </article>
  );
}

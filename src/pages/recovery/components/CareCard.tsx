import Button from '../../../components/Button';
import Chip from '../../../components/Chip';
import { cn } from '../../../lib/cn';
import { daysSince } from '../../../lib/date';
import { NO_TREATMENT_NAME, type CareCard as CareCardData } from '../../../types/card';

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

  /**
   * 카드의 현재 경과일.
   *
   * 목록 응답의 `dday`를 쓰면 안 된다 — 그건 같이 딸려오는 **최근 기록**의 경과일이라
   * (`recordId`·`recordedAt`·`photoUrls`와 한 덩어리다) 기록을 며칠 쉬면 그만큼 뒤처진다.
   * 실제로 8/8 시술 카드가 목록에서는 D+8(마지막 기록 8/16), 상세에서는 D+10(오늘 8/18)로
   * 갈렸다. 같은 카드가 화면마다 다른 숫자를 보이면 사용자는 어느 쪽을 믿어야 할지 모른다.
   *
   * 시술일이 D+0이라 시술일부터 센 날수가 곧 경과일이다(서버 확인).
   * 날짜를 못 읽으면 서버 값으로 물러난다 — 숫자가 사라지는 것보다는 낫다.
   */
  const dday = (card.treatmentDate ? daysSince(card.treatmentDate) : null) ?? card.dday ?? 0;

  /** 총 회복일도 비어 올 수 있다. 그때는 진행률을 지어내지 않고 경과일만 보여준다. */
  const totalDays = card.recoveryTotalDays ?? 0;
  const progress = totalDays > 0 ? Math.min(100, (dday / totalDays) * 100) : 0;

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
            <h3 className="typo-card-title">{card.treatmentName ?? NO_TREATMENT_NAME}</h3>
            {card.treatmentDate && (
              <p className="typo-caption text-text-secondary">시술일 {card.treatmentDate}</p>
            )}
          </div>
          <Chip>D+{dday}</Chip>
        </header>

        <div className="flex flex-col gap-1">
          <div className="bg-border-subtle rounded-bar h-1.5 w-full" aria-hidden>
            <div className="bg-primary rounded-bar h-full" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="typo-caption text-text-secondary">회복 진행</span>
            <span className="typo-caption text-text-secondary">
              {done ? '완료' : totalDays > 0 ? `${dday} / ${totalDays}일` : `${dday}일째`}
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

import BottomSheet from './BottomSheet';
import Chip from './Chip';
import { cn } from '../lib/cn';
import { useCards } from '../hooks/card/useCard';
import type { CareCard } from '../types/card';

type RecordCardSheetProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (cardId: string) => void;
};

/**
 * 기록 대상 카드 선택 시트 (시안 `기록 — 카드 선택 시트`).
 *
 * TabBar의 기록 버튼이 곧장 `/records/new`로 가지 않고 이 시트를 먼저 띄운다.
 * 어느 케어를 기록하는지가 정해져야 기록이 카드 안에 들어갈 수 있다.
 *
 * TabBar와 마찬가지로 탭 화면 어디서나 뜨는 공용 크롬이라 `components/`에 둔다.
 * 여는 상태는 TabLayout이 들고 있다.
 *
 * **완료된 카드는 목록에서 뺀다** — CareCard가 완료 카드의 `상태 기록` 버튼을 감추는 것과 같은 이유로,
 * 회복이 끝난 여정에 기록을 더 붙일 이유가 없다. 부제의 개수도 이 목록 기준이다.
 */
export default function RecordCardSheet({ open, onClose, onSelect }: RecordCardSheetProps) {
  const { data, isLoading, isError } = useCards();

  const cards = (data ?? []).filter((card: CareCard) => card.status === 'IN_PROGRESS');

  return (
    <BottomSheet open={open} onClose={onClose} label="기록할 케어 선택">
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="typo-card-title">어떤 케어를 기록할까요?</h2>
          <p className="typo-caption text-text-secondary">
            {isLoading
              ? '진행 중인 케어를 불러오고 있어요'
              : `진행 중인 케어가 ${cards.length}개예요`}
          </p>
        </header>

        {isLoading && (
          <div className="flex flex-col gap-2.5" aria-busy="true">
            <div className="bg-surface-raised rounded-md h-[61px] animate-pulse" />
            <div className="bg-surface-raised rounded-md h-[61px] animate-pulse" />
          </div>
        )}

        {isError && (
          <p className="typo-body text-text-secondary">케어 카드를 불러오지 못했어요.</p>
        )}

        {!isLoading && !isError && cards.length === 0 && (
          <p className="typo-body text-text-secondary">
            진행 중인 케어가 없어요. 받은 케어를 먼저 등록해주세요.
          </p>
        )}

        {cards.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {cards.map((card: CareCard) => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => onSelect(card.id)}
                  className={cn(
                    'rounded-md flex w-full items-center justify-between gap-2 px-3.5 py-3.5 text-left transition-colors',
                    // 오늘이 기록 권장일인 카드를 강조한다 — 사용자가 고민 없이 고르게 하는 게 목적이다
                    card.recordRecommended
                      ? 'bg-primary-tint border-primary border'
                      : 'bg-surface-raised hover:bg-surface-elevated',
                  )}
                >
                  <span className="flex flex-col gap-1">
                    <span className="typo-card-title">{card.name}</span>
                    <span className="typo-caption text-text-secondary">
                      시술일 {card.treatedAt}
                      {card.recordRecommended && ' · 오늘 기록 권장'}
                    </span>
                  </span>
                  <Chip className={cn(card.recordRecommended && 'bg-primary text-primary-on')}>
                    D+{card.dday}
                  </Chip>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button type="button" onClick={onClose} className="typo-body text-text-secondary py-3.5">
          취소
        </button>
      </div>
    </BottomSheet>
  );
}

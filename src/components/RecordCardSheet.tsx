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

  // 주석 명세 반영: 완료된 카드는 목록에서 제외
  const cards = (data ?? []).filter((card: CareCard) => card.status === 'IN_PROGRESS');

  return (
    <BottomSheet open={open} onClose={onClose} label="기록할 케어 선택">
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="typo-card-title text-text-primary">어떤 케어를 기록할까요?</h2>
          <p className="typo-caption text-text-secondary">
            {isLoading
              ? '진행 중인 케어를 불러오고 있어요'
              : `진행 중인 케어가 ${cards.length}개예요`}
          </p>
        </header>

        {isLoading && (
          <div className="flex flex-col gap-2.5" aria-busy="true">
            <div className="bg-surface-raised rounded-card h-[68px] animate-pulse" />
            <div className="bg-surface-raised rounded-card h-[68px] animate-pulse" />
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
              <li key={card.cardId}>
                <button
                  type="button"
                  onClick={() => onSelect(String(card.cardId))}
                  className={cn(
                    'rounded-card flex w-full items-center justify-between gap-2 px-3.5 py-3.5 text-left transition-colors',
                    'bg-surface-raised hover:bg-surface-elevated border border-transparent',
                  )}
                >
                  <span className="flex flex-1 flex-col gap-1 self-stretch">
                    <span className="typo-card-title text-text-primary self-stretch">
                      {card.treatmentName}
                    </span>
                    <span
                      className={cn(
                        'typo-caption self-stretch',
                        'text-text-tertiary',
                      )}
                    >
                      시술일 {card.treatmentDate}
                    </span>
                  </span>

                  <Chip
                    className={cn(
                      'flex items-center justify-center px-[10px] py-[5px] rounded-chip typo-caption shrink-0 text-primary-on',
                      'bg-surface-fill',
                    )}
                  >
                    D+{card.dday}
                  </Chip>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={onClose}
          className="typo-body text-text-secondary w-full py-3.5 text-center transition-colors hover:text-text-primary"
        >
          취소
        </button>
      </div>
    </BottomSheet>
  );
}
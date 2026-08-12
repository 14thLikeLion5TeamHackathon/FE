import Card from '../../../components/Card';
import { cn } from '../../../lib/cn';
import type { Treatment } from '../../../types/card';

type TreatmentListItemProps = {
  treatment: Treatment;
  selected: boolean;
  onToggle: () => void;
};

/** 시술 목록 한 줄 — 이름/설명 + 우측 선택 토글(체크·플러스). 복수 선택 가능. */
export default function TreatmentListItem({ treatment, selected, onToggle }: TreatmentListItemProps) {
  return (
    <button type="button" onClick={onToggle} aria-pressed={selected} className="block w-full text-left">
      <Card
        variant="block"
        className={cn(
          'flex items-center gap-3.5 py-3.5',
          'border',
          selected ? 'border-primary border-[1.5px]' : 'border-transparent',
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="typo-card-title truncate">{treatment.name}</p>
          <p className="typo-caption text-text-secondary mt-1 truncate">{treatment.description}</p>
        </div>

        <span
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-full',
            selected ? 'bg-primary' : 'border-border-strong border',
          )}
          aria-hidden
        >
          {selected ? (
            <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
              <path
                d="M1 3L3.5 5.5L8 1"
                className="stroke-primary-on"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 1V9M1 5H9"
                className="stroke-text-tertiary"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </Card>
    </button>
  );
}

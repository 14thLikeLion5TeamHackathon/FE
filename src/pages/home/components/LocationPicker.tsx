import { useState } from 'react';

import BottomSheet from '../../../components/BottomSheet';
import { cn } from '../../../lib/cn';
import { REGIONS } from '../../../lib/location';

type LocationPickerProps = {
  /** 현재 기준 위치 이름. GPS면 "현재 위치" */
  label: string;
  /** 직접 고른 지역 id. null이면 GPS */
  regionId: string | null;
  isLocating: boolean;
  gpsDenied: boolean;
  onSelect: (regionId: string | null) => void;
};

/**
 * 오늘 안내의 기준 위치를 바꾸는 진입점.
 * 기본은 GPS라 평소엔 읽기만 하는 한 줄이고, 눌렀을 때만 보기(시·도)를 시트로 펼친다.
 */
export default function LocationPicker({
  label,
  regionId,
  isLocating,
  gpsDenied,
  onSelect,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);

  const choose = (id: string | null) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-text-secondary flex items-center gap-1"
          aria-label={`기준 위치 ${label}. 눌러서 변경`}
        >
          {/* 핀 */}
          <svg viewBox="0 0 12 14" className="h-3.5 w-3 shrink-0" fill="none" aria-hidden>
            <path
              d="M6 1C3.8 1 2 2.8 2 5c0 2.9 4 8 4 8s4-5.1 4-8c0-2.2-1.8-4-4-4Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <circle cx="6" cy="5" r="1.4" fill="currentColor" />
          </svg>
          <span className="typo-caption">{isLocating ? '위치 확인 중…' : label}</span>
          <span className="typo-caption text-text-tertiary" aria-hidden>
            ⌄
          </span>
        </button>

        {gpsDenied && (
          <span className="typo-caption text-text-tertiary">
            위치 권한이 없어 {label} 기준으로 안내해요
          </span>
        )}
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} label="기준 위치 선택">
        <h2 className="typo-section mb-3.5">기준 위치</h2>

        {/* GPS는 성격이 달라 지역 그리드와 섞지 않고 위에 한 줄로 둔다 */}
        <CurrentLocationOption selected={regionId === null} onClick={() => choose(null)} />

        <div className="bg-border-subtle my-2.5 h-px w-full" aria-hidden />

        {/* 17개를 세로로 늘어놓으면 시트가 스크롤된다. 3열이면 한 화면에 다 들어온다 */}
        <ul className="grid grid-cols-3 gap-2">
          {REGIONS.map((region) => (
            <li key={region.id}>
              <RegionChip
                label={region.label}
                selected={regionId === region.id}
                onClick={() => choose(region.id)}
              />
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  );
}

function CurrentLocationOption({
  selected,
  onClick,
}: {
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'typo-body flex w-full items-center justify-between py-3 text-left',
        selected ? 'text-primary' : 'text-text-primary',
      )}
    >
      현재 위치
      {selected && (
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden>
          <path
            d="M1 4.5L4.5 8L11 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

/** 선택 상태 규칙은 카드 생성의 카테고리 칩과 같다 — tint 배경 + 스카이 테두리·글자 */
function RegionChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'typo-label rounded-chip w-full py-2.5 transition-colors select-none',
        selected
          ? 'bg-primary-tint text-primary border-primary border-[1.5px]'
          : 'bg-surface-fill text-text-secondary',
      )}
    >
      {label}
    </button>
  );
}

import { useState } from 'react';

import BottomSheet from '../../../components/BottomSheet';
import { cn } from '../../../lib/cn';
import { CITIES, findCity, formatLocation, type TodayLocation } from '../../../lib/location';

type LocationPickerProps = {
  location: TodayLocation;
  onSelect: (location: TodayLocation) => void;
};

/**
 * 오늘 안내의 기준 위치를 바꾸는 진입점.
 * 평소엔 읽기만 하는 한 줄이고, 눌렀을 때만 시트를 펼친다.
 *
 * 시트는 시 → 구 2단이다. 서버가 아는 조합이 시·구 쌍이라 둘 다 받아야 하는데,
 * 60여 개를 한 번에 늘어놓으면 고를 수가 없다.
 */
export default function LocationPicker({ location, onSelect }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  /** null이면 1차(시) 화면 */
  const [cityId, setCityId] = useState<string | null>(null);

  const city = CITIES.find((item) => item.id === cityId) ?? null;

  const openSheet = () => {
    // 열 때마다 지금 기준 위치의 시부터 보여준다 — 대개 같은 시 안에서 구만 바꾼다
    setCityId(findCity(location.city)?.id ?? null);
    setOpen(true);
  };

  const chooseDistrict = (district: string) => {
    if (!city) return;
    onSelect({ city: city.name, district });
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="text-text-secondary flex items-center gap-1"
        aria-label={`기준 위치 ${formatLocation(location)}. 눌러서 변경`}
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
        <span className="typo-caption">{formatLocation(location)}</span>
        <span className="typo-caption text-text-tertiary" aria-hidden>
          ⌄
        </span>
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} label="기준 위치 선택">
        <div className="mb-3.5 flex items-center gap-2">
          {city && (
            <button
              type="button"
              onClick={() => setCityId(null)}
              className="text-text-secondary typo-body -ml-1 px-1"
              aria-label="시 다시 선택"
            >
              ←
            </button>
          )}
          <h2 className="typo-section">{city ? city.label : '기준 위치'}</h2>
        </div>

        {/* 구는 서울만 25개라 시트가 넘친다. 높이를 묶고 목록만 스크롤시킨다 */}
        <ul className="grid max-h-[55vh] grid-cols-3 gap-2 overflow-y-auto">
          {city
            ? city.districts.map((district) => (
                <li key={district}>
                  <LocationChip
                    label={district}
                    selected={location.city === city.name && location.district === district}
                    onClick={() => chooseDistrict(district)}
                  />
                </li>
              ))
            : CITIES.map((item) => (
                <li key={item.id}>
                  <LocationChip
                    label={item.label}
                    selected={location.city === item.name}
                    onClick={() => setCityId(item.id)}
                  />
                </li>
              ))}
        </ul>
      </BottomSheet>
    </>
  );
}

/** 선택 상태 규칙은 카드 생성의 카테고리 칩과 같다 — tint 배경 + 스카이 테두리·글자 */
function LocationChip({
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

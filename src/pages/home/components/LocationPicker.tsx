import { useState } from 'react';

import BottomSheet from '../../../components/BottomSheet';
import { cn } from '../../../lib/cn';
import { CITIES, findCity, formatLocation, type TodayLocation } from '../../../lib/location';
import type { Coords, GeolocationStatus } from '../../../hooks/today/useTodayGeolocation';

type LocationPickerProps = {
  location: TodayLocation;
  onSelect: (location: TodayLocation) => void;
  /**
   * 지금 기준이 GPS 좌표인지.
   *
   * 이때 `location`은 아직 아무것도 고르지 않은 기본값이라 기준이 아니다.
   * 그대로 내보이면 칩은 "서울 강남구", 바로 옆 안내는 "현재 위치 기준"이라 서로 어긋난다.
   */
  usingGps?: boolean;
  /** useTodayGeolocation에서 내려오는 GPS 좌표 */
  gpsCoords?: Coords | null;
  /** useTodayGeolocation에서 내려오는 GPS 상태 */
  geoStatus?: GeolocationStatus;
  /** GPS 좌표 기반으로 현재 위치 사용 시 호출할 콜백 (picked를 false로 리셋) */
  onUseCurrentLocation?: () => void;
};

/**
 * 오늘 안내의 기준 위치를 바꾸는 진입점.
 * 평소엔 읽기만 하는 한 줄이고, 눌렀을 때만 시트를 펼친다.
 *
 * 시트는 시 → 구 2단이다. 17개 시도의 시군구를 한 번에 늘어놓으면 250개가 넘어 고를 수가 없다.
 * 좌표는 시도 단위(시청·도청)라 구 선택이 조회 결과를 바꾸지는 않는다 — 표시용이다.
 */
export default function LocationPicker({
  location,
  onSelect,
  usingGps = false,
  gpsCoords,
  geoStatus,
  onUseCurrentLocation,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  /** null이면 1차(시) 화면 */
  const [cityId, setCityId] = useState<string | null>(null);

  const city = CITIES.find((item) => item.id === cityId) ?? null;
  const label = usingGps ? '현재 위치' : formatLocation(location);

  const openSheet = () => {
    setCityId(findCity(location.city)?.id ?? null);
    setOpen(true);
  };

  const chooseDistrict = (district: string) => {
    if (!city) return;
    onSelect({ city: city.name, district });
    setOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (onUseCurrentLocation) {
      onUseCurrentLocation();
      setOpen(false);
    }
  };

  /** GPS 버튼을 보여줄 조건: GPS 좌표가 있고, 콜백이 있을 때 */
  const canUseGps = gpsCoords && onUseCurrentLocation;
  const gpsUnavailable = geoStatus === 'denied' || geoStatus === 'unsupported';

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
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
        <span className="typo-caption">{label}</span>
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

        {/* 현재 위치 사용 버튼 — 시 선택 화면에서만 노출 */}
        {!city && (
          <div className="mb-3 flex flex-col gap-1">
            {canUseGps && (
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className={cn(
                  'typo-label rounded-btn w-full border border-dashed py-2.5 transition-colors',
                  'border-primary text-primary',
                )}
              >
                현재 위치로 설정
              </button>
            )}
            {gpsUnavailable && (
              <p className="typo-caption text-text-tertiary">
                {geoStatus === 'denied'
                  ? '위치 권한이 차단되어 있어요. 브라우저 설정에서 허용해주세요.'
                  : '이 브라우저는 위치 기능을 지원하지 않아요.'}
              </p>
            )}
            {geoStatus === 'prompting' && (
              <p className="typo-caption text-text-tertiary">위치 권한을 확인 중이에요...</p>
            )}
          </div>
        )}

        {/* 경기도만 31개고 시 목록도 17개다. 높이를 묶고 목록만 스크롤시킨다 */}
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

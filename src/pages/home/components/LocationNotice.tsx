import type { GeolocationStatus } from '../../../hooks/today/useTodayGeolocation';
import { formatLocation, type TodayLocation } from '../../../lib/location';

type LocationNoticeProps = {
  status: GeolocationStatus;
  location: TodayLocation;
};

/**
 * 기준 위치 옆에 붙는 안내 한 줄.
 *
 * 목적은 "지금 보는 안내가 내 위치 기준인가, 내가 고른 지역 기준인가"를 알려주는 것이다.
 * 좌표를 못 쓰는 상태에서는 어느 지역인지 이름을 그대로 드러낸다 —
 * 사용자가 다른 동네 자외선을 자기 동네로 알고 보는 게 이 화면의 최악이다.
 */
export default function LocationNotice({ status, location }: LocationNoticeProps) {
  return (
    <p className="typo-caption text-text-tertiary" aria-live="polite">
      {getMessage(status, location)}
    </p>
  );
}

function getMessage(status: GeolocationStatus, location: TodayLocation): string {
  const place = formatLocation(location);

  switch (status) {
    case 'prompting':
      return '현재 위치 확인 중…';
    // 좌표를 얻어도 아직 안내에 반영하지 못한다. 확인됐다고만 하면
    // 사용자는 이 브리핑이 GPS 기준이라고 오해한다 — 기준 지역을 같이 붙인다
    case 'granted':
      return `현재 위치 확인됨 · ${place} 기준`;
    case 'denied':
      return `위치 권한이 없어 ${place} 기준으로 안내해요`;
    case 'unavailable':
      return `현재 위치를 확인하지 못해 ${place} 기준으로 안내해요`;
    case 'unsupported':
      return `위치 기능을 지원하지 않아 ${place} 기준으로 안내해요`;
  }
}

import Card from '../../../components/Card';
import { cn } from '../../../lib/cn';

export type StoreGuideProps = {
  /** 매장 이름 (예: "엠레드 강남점") */
  name: string;
  /** 거리/시간 정보 (예: "1.2km · 도보 15분") */
  distanceInfo?: string;
  /** 백엔드에서 전달받은 지도/길찾기 상세 URL */
  mapUrl?: string;
  /** 길찾기 버튼 직접 처리용 핸들러 (선택 사항) */
  onNavigate?: () => void;
  className?: string;
};

/**
 * 시안 `StoreGuide` (Pure Component)
 *
 * Figma 레이어 구조:
 * StoreGuide
 * ├── Label ("방문한 AAC 제휴 매장")
 * ├── Description ("회복이 마무리되는 시기예요...")
 * └── Shop
 *     ├── Info
 *     │   ├── Name ("엠레드 강남점")
 *     │   └── Dist ("1.2km · 도보 15분")
 *     └── Go ("길찾기")
 */
export default function StoreGuide({
  name,
  distanceInfo,
  mapUrl,
  onNavigate,
  className,
}: StoreGuideProps) {
  const handleNavigate = () => {
    // 1. 커스텀 핸들러 전달 시 우선 실행
    if (onNavigate) {
      onNavigate();
      return;
    }

    // 2. 백엔드가 준 mapUrl이 있다면 해당 지도로 새 창 열기
    if (mapUrl) {
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // 3. Fallback: URL이 없을 경우 카카오맵 검색 페이지 연결
    const fallbackUrl = `https://map.kakao.com/link/search/${encodeURIComponent(name)}`;
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className={cn(
        'mt-2 flex w-full flex-col items-start justify-center gap-[10px] rounded-card border border-accent bg-accent-tint p-4',
        className,
      )}
    >
      {/* 1. Label */}
      <h3 className="typo-section text-text-primary">방문한 AAC 제휴 매장</h3>

      {/* 2. Description */}
      <p className="w-full max-w-[330px] typo-body text-text-secondary">
        회복이 마무리되는 시기예요. 다음 관리를 상담해보세요.
      </p>

      {/* 3. Shop Box */}
      <div className="flex h-[56px] w-full items-center justify-between rounded-btn bg-surface-raised p-3">
        {/* Info (Name + Dist) */}
        <div className="flex flex-col items-start gap-[2px]">
          <span className="typo-label text-text-primary">{name}</span>
          {distanceInfo && (
            <span className="typo-label text-text-primary">{distanceInfo}</span>
          )}
        </div>

        {/* Go (길찾기 버튼) */}
        <button
          type="button"
          onClick={handleNavigate}
          className="typo-caption text-right text-accent transition-opacity hover:opacity-80 active:opacity-60"
        >
          길찾기
        </button>
      </div>
    </Card>
  );
}
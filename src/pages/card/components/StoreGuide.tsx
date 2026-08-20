import Card from '../../../components/Card';
import { cn } from '../../../lib/cn';

export type StoreGuideProps = {
  /** 매장 이름 (예: "엠레드 강남점") */
  name: string;
  /** 거리/시간 정보 (예: "1.2km · 도보 15분") */
  distanceInfo?: string;
  /**
   * 백엔드가 준 매장 홈페이지 URL(`visitedStore.url`).
   * 이름은 mapUrl이지만 지도 링크가 아니다 — 호출부가 넣는 값이 홈페이지 주소다.
   */
  mapUrl?: string;
  /** 홈페이지 버튼 직접 처리용 핸들러 (선택 사항) */
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
 *     └── Go ("홈페이지")
 */
export default function StoreGuide({
  name,
  distanceInfo,
  mapUrl,
  onNavigate,
  className,
}: StoreGuideProps) {
  /*
    열 곳이 없으면 감춘다.
    예전에는 URL이 없을 때 카카오맵 검색으로 물러났는데, 그건 문구가 "길찾기"일 때 성립하던
    폴백이다. "홈페이지"라고 써 붙인 채 지도 검색을 열면 누른 것과 다른 곳으로 데려가게 된다.
  */
  const canOpen = Boolean(onNavigate ?? mapUrl);

  /** 링크와 버튼에 같은 모양을 준다 — 하는 일이 같은데 생김새가 다르면 다른 기능으로 읽힌다 */
  const linkClassName =
    'typo-caption text-accent flex shrink-0 items-center gap-1 transition-opacity hover:opacity-80 active:opacity-60';

  const label = (
    <>
      홈페이지
      {/* 새 창으로 나간다는 관습적 표시 — 상자 밖으로 빠지는 화살표 */}
      <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden>
        <path
          d="M4.5 2H2.5V9.5H10V7.5M7 2H10V5M10 2L5.5 6.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

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
          {distanceInfo && <span className="typo-label text-text-primary">{distanceInfo}</span>}
        </div>

        {/*
          Go (홈페이지 바로가기)

          **버튼이 아니라 링크다.** `window.open`을 부르는 버튼으로 두면 우클릭·새 탭으로 열기·
          링크 주소 복사가 전부 안 되고, 스크린리더도 "버튼"이라고만 읽어 어디로 가는지 모른다.
          커스텀 핸들러를 받은 경우에만 버튼으로 물러난다 — 그때는 갈 주소가 우리에게 없다.
        */}
        {canOpen &&
          (mapUrl && !onNavigate ? (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
              /* 아이콘만으로는 새 창인 걸 모르는 사용자가 있다 — 낭독기에는 말로 알린다 */
              aria-label="매장 홈페이지 열기 (새 창)"
            >
              {label}
            </a>
          ) : (
            <button type="button" onClick={onNavigate} className={linkClassName}>
              {label}
            </button>
          ))}
      </div>
    </Card>
  );
}

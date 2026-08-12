import { cn } from '../lib/cn';

type BottomCTAProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** 좌측에 함께 둘 보조 버튼 (예: 삭제) */
  secondary?: { label: string; onClick?: () => void; tone?: 'default' | 'danger' };
  /** 🔥 하단에 추가할 서브 텍스트 (없으면 안 그려짐) */
  subText?: string | React.ReactNode; 
};

/**
 * 하단 고정 CTA 바.
 *
 * 시안 규칙: **입력 화면에만** 쓴다.
 * 결과·조회 화면(AI 피드백·카드 상세)의 버튼은 콘텐츠 흐름 안에 둔다.
 *
 * fixed라 문서 흐름에서 빠진다 — **이 컴포넌트를 쓰는 화면은 콘텐츠 하단에 `pb-28`(112px)을 준다.**
 * 시안의 Content padding-bottom 값이며, 바 높이(약 84px)에 여유를 더한 값이다.
 * 세이프 에어리어는 바가 자체 처리하므로 화면이 신경 쓸 필요 없다.
 */
export default function BottomCTA({ label, onClick, disabled = false, secondary, subText }: BottomCTAProps) {
  return (
    <div
      // 🔥 최상위를 flex-col(세로 정렬)로 변경
      className="bg-surface-canvas max-w-app fixed bottom-0 left-1/2 flex w-full -translate-x-1/2 flex-col items-center gap-2 px-5 pt-3.5"
      style={{ paddingBottom: `calc(24px + env(safe-area-inset-bottom))` }}
    >
      {/* 🔥 기존 버튼들을 가로(flex-row)로 묶어주는 래퍼 추가 */}
      <div className="flex w-full gap-2">
        {secondary && (
          <button
            type="button"
            onClick={secondary.onClick}
            className={cn(
              'typo-label rounded-btn border px-5 py-4',
              secondary.tone === 'danger'
                ? 'text-danger border-danger'
                : 'text-text-secondary border-border-strong',
            )}
          >
            {secondary.label}
          </button>
        )}
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            'typo-label rounded-btn flex-1 py-4',
            disabled ? 'bg-primary-disabled text-text-disabled' : 'bg-primary text-primary-on',
          )}
        >
          {label}
        </button>
      </div>

      {/* 🔥 subText가 전달되었을 때만 렌더링 (기존 화면 영향 0%) */}
      {subText && (
        <p className="typo-caption text-center text-text-tertiary">
          {subText}
        </p>
      )}
    </div>
  );
}
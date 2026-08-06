import { cn } from '../lib/cn';

type BottomCTAProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** 좌측에 함께 둘 보조 버튼 (예: 삭제) */
  secondary?: { label: string; onClick?: () => void; tone?: 'default' | 'danger' };
};

/** 하단 CTA 바 높이(px). SubLayout의 하단 패딩과 맞물린다. */
export const BOTTOM_CTA_HEIGHT = 88;

/**
 * 하단 고정 CTA 바.
 *
 * 시안 규칙: **입력 화면에만** 쓴다.
 * 결과·조회 화면(AI 피드백·카드 상세)의 버튼은 콘텐츠 흐름 안에 둔다.
 *
 * TabBar와 마찬가지로 fixed라 세이프 에어리어를 직접 처리한다.
 */
export default function BottomCTA({ label, onClick, disabled = false, secondary }: BottomCTAProps) {
  return (
    <div
      className="bg-surface-canvas max-w-app fixed bottom-0 left-1/2 flex w-full -translate-x-1/2 gap-2 px-5 pt-3.5"
      style={{ paddingBottom: `calc(24px + env(safe-area-inset-bottom))` }}
    >
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
  );
}

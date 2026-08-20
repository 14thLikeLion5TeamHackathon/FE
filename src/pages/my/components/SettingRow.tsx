import type { ReactNode } from 'react';

import { cn } from '../../../lib/cn';

type SettingRowProps = {
  label: string;
  /** 라벨 아래 보조 설명 */
  description?: string;
  /** 우측 값 텍스트 */
  value?: string;
  /** 우측에 들어갈 요소(Switch 등). value와 함께 쓰지 않는다. */
  action?: ReactNode;
  /** 우측 화살표 노출. onClick이 있으면 자동으로 켜지므로 보통 지정할 필요가 없다. */
  chevron?: boolean;
  /** 있으면 button으로, 없으면 div로 렌더된다. */
  onClick?: () => void;
  tone?: 'default' | 'danger';
  /**
   * 눌러도 아무 일이 없어야 하는 상태. 요청이 날아가는 동안 연타를 막는 데 쓴다 —
   * 되돌릴 수 없는 행(연동 해제·탈퇴)에서 같은 요청이 두 번 나가면 두 번째는 404가 된다.
   */
  disabled?: boolean;
};

function Chevron() {
  return (
    <svg
      viewBox="0 0 8 14"
      className="text-text-tertiary h-3.5 w-2 shrink-0"
      fill="none"
      aria-hidden
    >
      <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 마이 화면의 목록 행.
 * 마지막 행의 구분선은 `last:border-b-0`으로 지운다 — 부모가 자식을 세지 않아도 된다.
 */
export default function SettingRow({
  label,
  description,
  value,
  action,
  chevron,
  onClick,
  tone = 'default',
  disabled = false,
}: SettingRowProps) {
  const showChevron = chevron ?? Boolean(onClick);
  const className =
    'border-border-subtle flex w-full items-center gap-2 border-b py-3 text-left last:border-b-0';

  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className={cn('typo-body', tone === 'danger' ? 'text-danger' : 'text-text-primary')}>
          {label}
        </p>
        {/* 연동된 구글 계정 주소처럼 띄어쓰기 없는 긴 문자열이 들어온다 — 안 끊으면 행을 뚫는다 */}
        {description && (
          <p className="typo-caption text-text-tertiary mt-0.5 break-words">{description}</p>
        )}
      </div>

      {value && <span className="typo-body text-text-secondary truncate">{value}</span>}
      {action}
      {showChevron && <Chevron />}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(className, disabled && 'opacity-50')}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

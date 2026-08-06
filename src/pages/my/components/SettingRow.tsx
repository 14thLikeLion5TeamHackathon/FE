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
  /** 우측 화살표 노출 = 눌러서 이동하는 행 */
  href?: boolean;
  onClick?: () => void;
  tone?: 'default' | 'danger';
};

function Chevron() {
  return (
    <svg viewBox="0 0 8 14" className="text-text-tertiary h-3.5 w-2 shrink-0" fill="none" aria-hidden>
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
  href = false,
  onClick,
  tone = 'default',
}: SettingRowProps) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className="border-border-subtle flex w-full items-center gap-2 border-b py-3 text-left last:border-b-0"
    >
      <div className="min-w-0 flex-1">
        <p className={cn('typo-body', tone === 'danger' ? 'text-danger' : 'text-text-primary')}>
          {label}
        </p>
        {description && <p className="typo-caption text-text-tertiary mt-0.5">{description}</p>}
      </div>

      {value && <span className="typo-body text-text-secondary truncate">{value}</span>}
      {action}
      {href && <Chevron />}
    </Tag>
  );
}

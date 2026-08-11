import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../../../lib/cn';

type CategoryChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

/**
 * 시술 카테고리 단일 선택 칩.
 * Segment와 같은 규칙 — 선택 상태는 은은한 tint 배경 + 스카이 테두리 + 스카이 글자다.
 * 꽉 찬 primary 배경이 아니다 (화면당 primary는 4곳을 넘기지 않는다).
 */
export default function CategoryChip({
  selected = false,
  className,
  children,
  ...props
}: CategoryChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'typo-label rounded-chip shrink-0 px-3.5 py-2 whitespace-nowrap transition-colors select-none',
        selected
          ? 'bg-primary-tint text-primary border-primary border-[1.5px]'
          : 'bg-surface-fill text-text-secondary',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

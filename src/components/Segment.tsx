import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../lib/cn';

type SegmentProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /**
   * 세그먼트의 선택 여부 (Pure Component)
   */
  selected?: boolean;
  className?: string;
};

/**
 * 탭/선택 옵션에 사용되는 Pure Component `Segment`
 */
export default function Segment({
  children,
  selected = false,
  type = 'button',
  className,
  ...props // 👈 onClick 등 모든 기본 HTML button props가 외부에서 전달됩니다.
}: SegmentProps) {
  return (
    <button
      type={type}
      className={cn(
        // 피그마 CSS 스펙: flex-1, flex, items-center, justify-center, rounded-md(10px), py-[13px] px-0
        'flex flex-1 items-center justify-center rounded-md py-[13px] px-0 transition-colors cursor-pointer select-none',
        // 타이포그래피 스펙: typo-body (13px, font-normal 400, line-height 155%)
        'typo-body text-sm font-normal',

        // 1. 선택된 상태
        selected && 'border-[1.5px] border-primary bg-primary-tint text-primary',

        // 2. 선택되지 않은 상태
        !selected && 'border border-transparent bg-surface-fill text-text-secondary',

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
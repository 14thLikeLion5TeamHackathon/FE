import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../lib/cn';

type ChipProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /**
   * Chip의 진행/완료 상태
   * - in_progress: 진행 중 (bg-surface-fill)
   * - completed: 완료됨 (border-border-strong)
   */
  status?: 'in_progress' | 'completed';
  className?: string;
};

/**
 * 상태 표시에 사용하는 `Chip` 컴포넌트.
 * - 패딩: py-1 px-[10px] (4px 10px)
 * - 라운딩: rounded-chip
 * - 폰트: typo-caption (11px / font-medium(500) / line-height 13px)
 */
export default function Chip({
  children,
  status = 'in_progress',
  className,
  ...props
}: ChipProps) {
  return (
    <div
      className={cn(
        // 피그마 CSS 스펙: inline-flex, items-center, rounded-chip, py-1(4px), px-[10px](10px)
        'inline-flex items-center rounded-chip py-1 px-[10px]',
        // 타이포그래피 스펙: typo-caption, font-medium(500), text-text-primary
        'typo-caption font-medium text-text-primary',

        // 1. 진행 중 (background: var(--color-surface-fill))
        status === 'in_progress' && 'bg-surface-fill',

        // 2. 완료됨 (border: 1px solid var(--color-border-strong))
        status === 'completed' && 'border border-border-strong bg-transparent',

        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
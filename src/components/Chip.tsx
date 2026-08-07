import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type ChipProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Chip 변형 스타일
   * - fill: 채워진 형태
   * - outline: 테두리 형태
   */
  variant?: 'fill' | 'outline';
};

export default function Chip({
  variant = 'fill',
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <div
      className={cn(
        // 패딩 4/10, typo-caption 토큰 적용
        'inline-flex items-center justify-center py-[4px] px-[10px] rounded-full typo-caption transition-colors select-none',

        // 1. Fill Variant
        variant === 'fill' && 'bg-primary text-primary-on',

        // 2. Outline Variant
        variant === 'outline' && 'border border-border-strong bg-transparent text-text-secondary',

        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
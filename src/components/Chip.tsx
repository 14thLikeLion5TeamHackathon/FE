import type { HTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type ChipProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Chip 변형 스타일
   * - fill: 채워진 형태 (기본값)
   * - outline: 테두리 형태
   */
  variant?: 'fill' | 'outline';
};

/**
 * 시안 `Chip` (Figma `공용 컴포넌트` > Chip).
 * D-day 배지 · 증상 태그 · 근거 칩 등에 두루 쓰인다.
 *
 * 색이 고정이라 그대로 쓰면 되고, 선택 상태처럼 색이 달라지는 자리는
 * 쓰는 쪽에서 `className`으로 덮는다 (예: 카드 생성의 선택된 카테고리 칩).
 */
export default function Chip({ variant = 'fill', className, children, ...props }: ChipProps) {
  return (
    <div
      className={cn(
        // 공통 — 패딩 4/10, 라벨은 typo-caption(11px)
        'typo-caption rounded-chip text-text-primary inline-flex items-center justify-center px-2.5 py-1 select-none',

        variant === 'fill' && 'bg-surface-fill',
        variant === 'outline' && 'border-border-strong border',

        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

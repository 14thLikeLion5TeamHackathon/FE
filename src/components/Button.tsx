import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../lib/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /**
   * 버튼의 시각적 스타일 변주
   * - primary: 기본 브랜드 메인 버튼
   */
  variant?: 'primary';
  className?: string;
};

/**
 * 시안의 기본 `Button`.
 * - 패딩: py-2 px-[10px] (8px 10px)
 * - 폰트: typo-label (12px / font-medium(500) / line-height 14px)
 * - 활성화: bg-primary, text-primary-on
 * - 비활성화: border-border-strong, text-text-tertiary
 */
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        // 공통 레이아웃 및 폰트 스펙 (typo-label 적용)
        'inline-flex items-center justify-center rounded-sm py-2 px-[10px] typo-label font-medium transition-colors',

        // 1. 활성화 상태 (bg-primary + text-primary-on)
        !disabled && variant === 'primary' && 'bg-primary text-primary-on',

        // 2. 비활성화 상태 (border-border-strong + text-text-tertiary)
        disabled && 'border border-border-strong text-text-tertiary cursor-not-allowed',

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
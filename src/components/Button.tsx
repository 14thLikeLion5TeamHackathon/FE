import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * 버튼 스타일 변형
   * - primary: 주요 동작 버튼 (기본값)
   * - secondary: 보조 동작 버튼
   */
  variant?: 'primary' | 'secondary';
};

export default function Button({
  variant = 'primary',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        // 공통 기본 스타일 (패딩: 8/10, typo-body 활용)
        'w-full py-[8px] px-[10px] rounded-sm typo-body font-bold transition-colors select-none flex items-center justify-center',
        
        // 1. Primary Variant
        variant === 'primary' && !disabled && 'bg-primary text-primary-on hover:opacity-90',

        // 2. Secondary Variant
        variant === 'secondary' && !disabled && 'bg-surface-sunken text-text-primary border border-border-strong hover:bg-surface',

        // 3. Disabled State (변형 상관없이 비활성화 스타일 적용)
        disabled && 'bg-surface-sunken text-text-disabled border border-border-strong cursor-not-allowed',

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * 버튼 스타일 변형
   * - primary: 주요 동작 버튼 (기본값)
   * - secondary: 보조 동작 버튼. 비활성이 아니라 **함께 놓이는 보조 액션**이다
   */
  variant?: 'primary' | 'secondary';
};

/**
 * 시안 `Button` (Figma `공용 컴포넌트` > Button).
 * 내용에 맞춰 줄어드는 크기(HUG)다 — 폭을 채우려면 쓰는 쪽에서 `className="w-full"`을 준다.
 * CareCard처럼 두 버튼이 나란히 놓이는 자리가 있어서 기본을 w-full로 두면 안 된다.
 */
export default function Button({
  variant = 'primary',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        // 공통 — 패딩 8/10, 라벨은 typo-label(12px). 굵기는 유틸이 정하므로 따로 주지 않는다.
        'typo-label rounded-sm inline-flex items-center justify-center px-2.5 py-2 transition-colors select-none',

        variant === 'primary' && !disabled && 'bg-primary text-primary-on hover:opacity-90',

        // Secondary — 배경 없이 외곽선만
        variant === 'secondary' &&
          !disabled &&
          'border-border-strong text-text-secondary border hover:opacity-80',

        // Disabled — BottomCTA와 같은 처리
        disabled && 'bg-primary-disabled text-text-disabled cursor-not-allowed',

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

import type { InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /**
   * 체크박스의 선택 여부 (Pure Component)
   * - true: 선택됨 (bg-primary + 체크 아이콘 표시)
   * - false: 선택되지 않음 (border-border-strong 1.5px)
   */
  checked?: boolean;
  className?: string;
};

/**
 * 선택/해제에 사용하는 `Checkbox` 순수 컴포넌트.
 * - 규격: 22px * 22px, rounded-[6px]
 * - 아이콘: width 11px, height 8px (SVG 적용)
 */
export default function Checkbox({
  checked = false,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={cn(
        // 피그마 CSS 스펙: width 22px, height 22px, rounded-[6px]
        'relative inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] transition-colors select-none',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',

        // 1. 선택된 상태 (fill/bg: primary)
        checked && 'bg-primary border-none',

        // 2. 선택되지 않은 상태 (border: 1.5px solid border-strong)
        !checked && 'border-[1.5px] border-border-strong bg-transparent',

        className,
      )}
    >
      {/* 실제 숨겨진 native input (접근성 및 키보드 조작용) */}
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="sr-only peer"
        {...props}
      />

      {/* 선택되었을 때만 노출되는 SVG 체크 아이콘 */}
      {checked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="11"
          height="8"
          viewBox="0 0 11 8"
          fill="none"
          className="pointer-events-none"
        >
          <path
            d="M1 4L4 7L10 1"
            className="stroke-text-secondary"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </label>
  );
}
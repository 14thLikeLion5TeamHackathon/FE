import type { InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  checked?: boolean;
  className?: string;
};

export default function Checkbox({
  checked = false,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={cn(
        'relative inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] transition-colors select-none',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',

        // 1. 선택된 상태
        checked && 'bg-primary border-none',

        // 2. 선택되지 않은 상태
        !checked && 'border-[1.5px] border-border-strong bg-transparent',

        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="sr-only peer"
        {...props}
      />

      {/* 시안 스펙: width 9px, height 6px / stroke: primary-on */}
      {checked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="9"
          height="6"
          viewBox="0 0 9 6"
          fill="none"
          className="pointer-events-none"
        >
          <path
            d="M1 3L3.5 5.5L8 1"
            className="stroke-primary-on"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </label>
  );
}

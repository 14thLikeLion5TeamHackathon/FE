import type { InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  className?: string;
};

export default function Field({
  value,
  className,
  disabled,
  ...props
}: FieldProps) {
  // value 존재 여부로 입력 상태 판단 (uncontrolled warning 방지)
  const hasValue = Boolean(value && String(value).length > 0);

  return (
    <div
      className={cn(
        // typo-body 내부 설정(13px)을 온전히 사용하도록 text-sm 제거
        'flex items-center w-full px-[14px] py-[12px] rounded-md bg-surface-sunken border transition-colors typo-body',
        
        // 테두리 조건
        hasValue ? 'border-primary' : 'border-border-strong',

        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <input
        value={value}
        disabled={disabled}
        className="w-full bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none"
        {...props}
      />
    </div>
  );
}
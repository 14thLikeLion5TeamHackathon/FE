import type { InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type FieldProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * 텍스트 입력창 `Field` (Pure Component)
 * - 비입력(기본): border-border-subtle, text-text-tertiary
 * - 입력(활성화): border-primary (1.5px), text-text-primary
 * - 패딩: 14px, 라운딩: rounded-md (10px)
 */
export default function Field({ className, value, defaultValue, ...props }: FieldProps) {
  // 💡 내부 state 없이, 들어온 value/defaultValue 유무로만 '입력 여부'를 판단함 (Pure)
  const isFilled = Boolean(
    (value !== undefined && value !== '') || 
    (defaultValue !== undefined && defaultValue !== '')
  );

  return (
    <input
      type="text"
      value={value}
      defaultValue={defaultValue}
      className={cn(
        // 공통 레이아웃: flex, padding(14px), rounded-md(10px), bg-surface-raised
        'flex items-start rounded-md p-[14px] bg-surface-raised transition-all outline-none w-full',
        // 타이포그래피: typo-body, 13px, 400
        'typo-body text-sm',

        // 1. 비입력 상태 (Default)
        !isFilled && 'border border-border-subtle text-text-tertiary',

        // 2. 입력 상태 (Active/Filled)
        isFilled && 'border-[1.5px] border-primary text-text-primary',

        className,
      )}
      {...props}
    />
  );
}
import type { InputHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  className?: string;
};

/**
 * 시안 `Field` (Figma `공용 컴포넌트` > Field).
 * **입력칸만 담당한다** — 라벨과 필수/선택 마커는 쓰는 쪽 화면에서 그린다.
 *
 * 값이 있으면 테두리가 primary 1.5px로 바뀐다(시안 `State=Filled`).
 */
export default function Field({ value, className, disabled, ...props }: FieldProps) {
  const hasValue = Boolean(value && String(value).length > 0);

  return (
    <div
      className={cn(
        // 공통 — 패딩 14, 배경은 surface-raised (sunken은 탭바 전용이라 쓰지 않는다)
        'typo-body rounded-md bg-surface-raised flex w-full items-center border p-3.5 transition-colors',

        hasValue ? 'border-primary border-[1.5px]' : 'border-border-subtle',

        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        value={value}
        disabled={disabled}
        className="text-text-primary placeholder:text-text-tertiary w-full bg-transparent focus:outline-none"
        {...props}
      />
    </div>
  );
}

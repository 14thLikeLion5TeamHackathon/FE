import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type SegmentProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export default function Segment({
  selected = false,
  className,
  children,
  ...props
}: SegmentProps) {
  return (
    <button
      type="button"
      className={cn(
        // typo-body 내부 설정(13px)을 온전히 사용하도록 text-sm 제거
        'flex-1 py-[13px] px-0 rounded-md typo-body transition-colors select-none text-center',
        
        // 선택 상태
        selected && 'bg-primary text-primary-on font-bold',
        
        // 미선택 상태
        !selected && 'bg-surface-sunken text-text-secondary font-normal border border-border-strong',

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
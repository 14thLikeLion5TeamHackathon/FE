import { useRef } from 'react';

import { cn } from '../lib/cn';
import { formatDateDisplay, fromDateInputValue, toDateInputValue } from '../lib/date';

type DateFieldProps = {
  /** 앱 표준 포맷 "YYYY.MM.DD". 값이 없으면 '' */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * 날짜 입력 — 자유 텍스트 대신 네이티브 달력 선택기를 연다.
 * 값은 앱 표준 포맷 "YYYY.MM.DD"로 주고받고, 화면에는 요일을 붙여 보여준다.
 * `Field`와 마찬가지로 입력칸만 담당한다 — 라벨·필수 마커는 쓰는 쪽 화면에서 그린다.
 */
export default function DateField({
  value,
  onChange,
  placeholder = 'YYYY.MM.DD',
  className,
}: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.focus();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <svg
        viewBox="0 0 16 16"
        className="text-text-tertiary pointer-events-none absolute top-1/2 left-3.5 z-10 h-4 w-4 -translate-y-1/2"
        fill="none"
        aria-hidden
      >
        <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M2 6.5H14M5 1.5V3.5M11 1.5V3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'typo-body rounded-md bg-surface-raised flex w-full items-center border p-3.5 pl-10 text-left transition-colors',
          value ? 'border-primary border-[1.5px]' : 'border-border-subtle',
        )}
      >
        {value ? (
          <span className="text-text-primary">{formatDateDisplay(value)}</span>
        ) : (
          <span className="text-text-tertiary">{placeholder}</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value ? toDateInputValue(value) : ''}
        onChange={(e) => onChange(e.target.value ? fromDateInputValue(e.target.value) : '')}
        aria-hidden
        tabIndex={-1}
        className="sr-only"
      />
    </div>
  );
}

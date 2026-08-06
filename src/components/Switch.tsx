import { cn } from '../lib/cn';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** 스크린리더가 읽을 이름. 옆에 라벨 텍스트가 따로 있어도 필요하다. */
  label: string;
};

/**
 * 시안의 `Switch` (42×24, 노브 18).
 * div가 아니라 button + role="switch"로 만든다 — 키보드 포커스와 스페이스바 토글이 공짜로 붙는다.
 */
export default function Switch({ checked, onChange, disabled = false, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-[42px] shrink-0 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-surface-fill-strong',
        disabled && 'opacity-40',
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] size-[18px] rounded-full transition-all',
          checked ? 'bg-primary-on left-[21px]' : 'bg-text-tertiary left-[3px]',
        )}
      />
    </button>
  );
}

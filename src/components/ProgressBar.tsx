import { cn } from '../lib/cn';

type ProgressBarProps = {
  /** 진행량. 비율이 아니라 **원시 개수**를 넘긴다 — `value={doneCount} max={totalCount}` */
  value: number;
  /** 전체량. 백분율을 직접 넘길 때만 기본값 100을 쓴다 */
  max?: number;
  label: string;
  className?: string;
};

export default function ProgressBar({ value, max = 100, label, className }: ProgressBarProps) {
  /**
   * `value`가 NaN·Infinity면 Math.min/max를 그대로 통과해 `width: 'NaN%'`(CSS가 버려서
   * 0%로 보인다)와 `aria-valuenow="NaN"`이 DOM까지 새어나가므로 여기서 막는다.
   *
   * max가 0이면(예: 항목 0개) 진행률 자체가 정의되지 않는다. 이때는 `aria-valuenow`를
   * 아예 빼서 indeterminate로 알린다 — 0으로 내보내면 스크린리더가 "0퍼센트 완료"라고
   * 읽어, 할 일이 남은 것처럼 들린다.
   */
  const hasRange = Number.isFinite(max) && max > 0;
  const safeValue =
    hasRange && Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : undefined;
  const percent = hasRange && safeValue !== undefined ? (safeValue / max) * 100 : 0;

  return (
    <div
      className={cn('bg-border-subtle h-1.5 w-full overflow-hidden rounded-bar', className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={hasRange ? max : undefined}
    >
      <div
        className="bg-primary h-full rounded-bar transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

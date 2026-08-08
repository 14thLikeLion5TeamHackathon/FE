import { cn } from '../lib/cn';

type ProgressBarProps = {
  value: number;
  max?: number;
  label: string;
  className?: string;
};

export default function ProgressBar({ value, max = 100, label, className }: ProgressBarProps) {
  /**
   * 호출부가 `doneCount / totalCount`처럼 계산해 넘기면 0으로 나눈 NaN이 들어온다.
   * NaN은 Math.min/max를 그대로 통과해 `width: 'NaN%'`(CSS가 버려서 0%로 보임)와
   * `aria-valuenow="NaN"`까지 새어나가므로 여기서 막는다.
   *
   * max가 0이면 진행률을 정의할 수 없어 빈 바로 둔다. 다만 aria 범위까지 0으로 내보내면
   * min===max인 잘못된 progressbar가 되어 스크린리더가 퍼센트를 못 읽으므로 100으로 보정한다.
   */
  const hasRange = Number.isFinite(max) && max > 0;
  const safeMax = hasRange ? max : 100;
  const safeValue = hasRange && Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : 0;
  const percent = (safeValue / safeMax) * 100;

  return (
    <div
      className={cn('bg-border-subtle h-1.5 w-full overflow-hidden rounded-bar', className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={safeMax}
    >
      <div
        className="bg-primary h-full rounded-bar transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

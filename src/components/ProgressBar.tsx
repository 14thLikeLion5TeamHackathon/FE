import { cn } from '../lib/cn';

type ProgressBarProps = {
  value: number;
  max?: number;
  className?: string;
};

export default function ProgressBar({ value, max = 100, className }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn('bg-border-subtle h-1.5 w-full overflow-hidden rounded-chip', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="bg-primary h-full rounded-chip transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
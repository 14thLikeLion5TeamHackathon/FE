import { cn } from '../lib/cn';

type ProgressBarProps = {
  value: number;
  max?: number;
  label: string;
  className?: string;
};

export default function ProgressBar({ value, max = 100, label, className }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const safeValue = max > 0 ? Math.min(max, Math.max(0, value)) : 0;

  return (
    <div
      className={cn('bg-border-subtle h-1.5 w-full overflow-hidden rounded-bar', className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="bg-primary h-full rounded-bar transition-[width]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

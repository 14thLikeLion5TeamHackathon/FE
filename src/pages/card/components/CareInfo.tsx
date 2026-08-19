import Card from '../../../components/Card';
import { cn } from '../../../lib/cn';

export type CareInfoProps = {
  date: string;
  dday: number;
  totalDays?: number;
  className?: string;
};

export default function CareInfo({ date, dday, totalDays = 29, className }: CareInfoProps) {
  const progressPercent = Math.min(Math.round((dday / totalDays) * 100), 100);

  return (
    <Card
      className={cn(
        'flex w-full flex-col gap-2.5 rounded-card border border-border-subtle bg-surface-raised p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="typo-caption text-text-tertiary">시술일 {date}</span>
          <span className="mt-0.5 typo-card-title text-text-primary font-bold">회복 진행</span>
        </div>
        <div className="flex items-baseline gap-1">
          {/* 🎯 text-primary 적용 */}
          <span className="typo-section font-bold text-primary">D+{dday}</span>
          <span className="typo-caption text-text-tertiary">/ {totalDays}일</span>
        </div>
      </div>

      {/* 프로그레스 바 영역 */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-fill">
        {/* 🎯 bg-primary로 색상 확실히 적용 */}
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </Card>
  );
}

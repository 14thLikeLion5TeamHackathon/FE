import Card from '../../../components/Card';
import { cn } from '../../../lib/cn';

export type TodayCareProps = {
  items: string | string[];
  /** 목록 아래 보조 문구. 기본값 없이, 필요한 화면에서만 넘긴다 */
  subText?: string;
  className?: string;
};

export default function TodayCare({ items, subText, className }: TodayCareProps) {
  const itemList = Array.isArray(items) ? items : [items];

  return (
    <Card
      className={cn(
        'flex w-full flex-col items-start gap-[10px] rounded-card border border-border-subtle bg-surface-raised p-4',
        className,
      )}
    >
      <h3 className="typo-section text-text-primary">오늘의 관리</h3>

      <div className="flex w-full flex-col gap-2">
        {itemList.map((item, index) => (
          <div key={index} className="flex w-full items-start gap-2">
            {/* 🎯 Dot: inline-block + bg-primary 명시 */}
            <span className="mt-[7px] inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-primary" />
            <p className="flex-1 typo-body text-text-secondary">{item}</p>
          </div>
        ))}
      </div>

      {subText && <p className="mt-1 w-full typo-caption text-text-tertiary">{subText}</p>}
    </Card>
  );
}

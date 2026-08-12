import Card from '../../../components/Card';
import { cn } from '../../../lib/cn';

export type CautionsProps = {
  /** 주의사항 항목 (단일 문장 또는 문장 배열) */
  items: string | string[];
  className?: string;
};

/**
 * 시안 `Cautions` (Pure Component)
 *
 * Figma 레이어 구조:
 * Cautions
 * ├── Label ("주의사항")
 * └── Item (Dot 5x5[text-tertiary] + Text) x N개
 */
export default function Cautions({ items, className }: CautionsProps) {
  // 단일 string으로 전달되어도 배열로 안전하게 변환
  const itemList = Array.isArray(items) ? items : [items];

  return (
    <Card
      className={cn(
        'flex w-full flex-col items-start gap-[10px] rounded-card border border-border-subtle bg-surface-raised p-4',
        className,
      )}
    >
      {/* 1. Label */}
      <h3 className="typo-section text-text-primary">주의사항</h3>

      {/* 2. Item List */}
      <div className="flex w-full flex-col gap-2">
        {itemList.map((item, index) => (
          <div key={index} className="flex w-full items-start gap-2">
            {/* Dot (5x5, text-tertiary color) */}
            <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-text-tertiary" />
            {/* Text */}
            <p className="flex-1 typo-body text-text-secondary">{item}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
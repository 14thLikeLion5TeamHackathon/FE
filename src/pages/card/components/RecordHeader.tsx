import { cn } from '../../../lib/cn';

export type RecordHeaderProps = {
  /** 회복 기록 카드 개수 (RecordCard 개수) */
  count: number;
  /** 타이틀 (기본값: "회복 기록") */
  title?: string;
  className?: string;
};

/**
 * 시안 `RecordHeader` (Pure Component)
 *
 * Figma 레이어 구조:
 * RecordHeader
 * ├── Title ("회복 기록")
 * └── Count ("N건")
 */
export default function RecordHeader({
  count,
  title = '회복 기록',
  className,
}: RecordHeaderProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between',
        className,
      )}
    >
      {/* Title */}
      <h2 className="typo-section text-text-primary">{title}</h2>

      {/* Count */}
      <span className="typo-caption text-right text-text-tertiary">
        {count}건
      </span>
    </div>
  );
}
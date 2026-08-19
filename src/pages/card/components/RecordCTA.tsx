import { cn } from '../../../lib/cn';

export type RecordCTAProps = {
  /** 버튼 클릭 이벤트 (상위에서 이동 logic 전달) */
  onClick: () => void;
  label?: string;
  subText?: string;
  className?: string;
};

export default function RecordCTA({
  onClick,
  label = '오늘 상태 기록하기',
  subText,
  className,
}: RecordCTAProps) {
  return (
    <div className={cn('flex w-full flex-col items-center gap-[6px]', className)}>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-center rounded-btn bg-primary py-[14px] transition-opacity active:opacity-90"
      >
        <span className="text-center typo-label text-primary-on">{label}</span>
      </button>

      {subText && <p className="text-center typo-caption text-text-tertiary">{subText}</p>}
    </div>
  );
}

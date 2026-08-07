import { cn } from '../../../lib/cn';
import { DOW_LABELS, formatDayLabel } from '../../../lib/date';

type DayCellProps = {
  date: Date;
  selected?: boolean;
  /** 일정·자외선·회복 분기점이 있으면 점을 찍는다 */
  marked?: boolean;
  /** 예보 범위 밖. 흐리게 처리한다 */
  outOfForecast?: boolean;
  /** 요일 줄 노출 여부. 주 모드는 켜고 월 모드는 상단에 따로 있어 끈다 */
  showDow?: boolean;
  onSelect?: (date: Date) => void;
};

/** 시안 `DayCell`. 선택되면 배경이 primary가 되고 안쪽 글자·점이 전부 primary/on으로 바뀐다. */
export default function DayCell({
  date,
  selected = false,
  marked = false,
  outOfForecast = false,
  showDow = false,
  onSelect,
}: DayCellProps) {
  /**
   * 화면에는 숫자만 보이므로 읽을 이름을 따로 준다.
   * 숫자 42개가 늘어선 그리드라 "7, 버튼"만으로는 아무것도 알 수 없다.
   * 점·흐림 같은 시각 표시도 말로 옮긴다 — 색과 모양으로만 전달하지 않는다.
   */
  const label = [
    formatDayLabel(date),
    marked ? '케어 주의일' : null,
    outOfForecast ? '예보 범위 밖' : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      onClick={() => onSelect?.(date)}
      aria-pressed={selected}
      aria-label={label}
      className={cn(
        'rounded-sm flex flex-col items-center gap-1 p-2 transition-colors',
        selected && 'bg-primary',
        outOfForecast && !selected && 'opacity-35',
      )}
    >
      {showDow && (
        <span
          aria-hidden
          className={cn('typo-caption', selected ? 'text-primary-on' : 'text-text-secondary')}
        >
          {DOW_LABELS[date.getDay()]}
        </span>
      )}
      <span
        aria-hidden
        className={cn('typo-section', selected ? 'text-primary-on' : 'text-text-primary')}
      >
        {date.getDate()}
      </span>
      {/* 점이 없어도 자리를 차지해야 날짜 높이가 흔들리지 않는다 */}
      <span
        aria-hidden
        className={cn(
          'size-1 rounded-full',
          marked ? (selected ? 'bg-primary-on' : 'bg-primary') : 'bg-transparent',
        )}
      />
    </button>
  );
}

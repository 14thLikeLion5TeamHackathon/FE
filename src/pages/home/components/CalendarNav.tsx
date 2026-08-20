import { cn } from '../../../lib/cn';
import {
  addDays,
  addMonths,
  formatMonthLabel,
  formatShortMonthLabel,
  isSameDay,
  startOfDay,
  startOfWeek,
} from '../../../lib/date';
import MonthGrid from './MonthGrid';
import WeekStrip from './WeekStrip';

type CalendarNavProps = {
  /** 보고 있는 기간의 기준 날짜 */
  anchor: Date;
  selected: Date;
  mode: 'week' | 'month';
  markedKeys: Set<string>;
  outOfForecastKeys: Set<string>;
  /** 이 날짜 이전은 고를 수 없다. 경계를 모르면 null이고, 그때는 아무것도 막지 않는다 */
  minDate?: Date | null;
  /** "예보는 8월 16일까지 제공돼요" */
  forecastNote?: string | null;
  /** "8월 3일 시술 이전은 안내가 없어요" */
  startNote?: string | null;
  onAnchorChange: (date: Date) => void;
  onSelect: (date: Date) => void;
  onModeChange: (mode: 'week' | 'month') => void;
};

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="bg-surface-elevated rounded-sm text-text-secondary px-2.5 py-1"
    >
      {children}
    </button>
  );
}

/**
 * 주/월 전환 캘린더.
 * 우측 `+ 일정`은 일정 직접 입력 진입점이다 — 캘린더를 연동하지 않아도 서비스가 성립하게 하는 장치.
 * `오늘` 버튼은 이미 오늘이 포함된 기간을 보고 있으면 숨긴다.
 */
export default function CalendarNav({
  anchor,
  selected,
  mode,
  markedKeys,
  outOfForecastKeys,
  minDate,
  forecastNote,
  startNote,
  onAnchorChange,
  onSelect,
  onModeChange,
}: CalendarNavProps) {
  const move = (direction: 1 | -1) => {
    onAnchorChange(mode === 'week' ? addDays(anchor, 7 * direction) : addMonths(anchor, direction));
  };

  const today = startOfDay(new Date());
  /** 현재 기간을 보고 있을 때는 `오늘` 버튼을 숨긴다 */
  const showTodayButton =
    mode === 'week'
      ? !isSameDay(startOfWeek(today), startOfWeek(anchor))
      : today.getFullYear() !== anchor.getFullYear() || today.getMonth() !== anchor.getMonth();

  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-center justify-between">
        <IconButton label="이전" onClick={() => move(-1)}>
          <span className="typo-body">‹</span>
        </IconButton>

        <button
          type="button"
          onClick={() => onModeChange(mode === 'week' ? 'month' : 'week')}
          className="flex items-center gap-1"
          aria-label={mode === 'week' ? '월 단위로 보기' : '주 단위로 보기'}
        >
          <span className="typo-section">
            {mode === 'week' ? formatShortMonthLabel(anchor) : formatMonthLabel(anchor)}
          </span>
          <span
            className={cn('typo-caption text-text-secondary', mode === 'month' && 'rotate-180')}
          >
            ⌄
          </span>
        </button>

        <div className="flex items-center gap-1">
          {showTodayButton && (
            <button
              type="button"
              onClick={() => {
                onAnchorChange(today);
                onSelect(today);
              }}
              className="bg-surface-elevated rounded-sm typo-caption text-text-secondary px-2.5 py-1"
            >
              오늘
            </button>
          )}
          <IconButton label="다음" onClick={() => move(1)}>
            <span className="typo-body">›</span>
          </IconButton>
        </div>
      </header>

      {mode === 'week' ? (
        <WeekStrip
          anchor={anchor}
          selected={selected}
          markedKeys={markedKeys}
          outOfForecastKeys={outOfForecastKeys}
          minDate={minDate}
          onSelect={onSelect}
        />
      ) : (
        <MonthGrid
          anchor={anchor}
          selected={selected}
          markedKeys={markedKeys}
          outOfForecastKeys={outOfForecastKeys}
          minDate={minDate}
          onSelect={onSelect}
        />
      )}

      {/*
        못 고르는 날짜가 화면에 있을 때만 이유를 말한다. 흐린 칸이 안 보이는데 설명만 뜨면
        무엇을 가리키는 말인지 알 수 없다. 주 모드에서도 필요하다 — 예보 안내와 달리
        이건 "왜 안 눌리지"에 대한 답이라 안 보이면 고장으로 읽힌다.
      */}
      {startNote && <p className="typo-caption text-text-tertiary">{startNote}</p>}

      {mode === 'month' && forecastNote && (
        <p className="typo-caption text-text-tertiary">{forecastNote}</p>
      )}
    </section>
  );
}

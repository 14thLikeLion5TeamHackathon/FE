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

/**
 * 셰브론. `NavHeader`·`SettingRow`와 같은 8×14 형태를 쓴다 —
 * 한 화면에 두 가지 화살표가 섞이면 서로 다른 기능처럼 읽힌다.
 *
 * 전에는 `‹` `›` `⌄` 문자를 그대로 썼는데, 폰트가 그리는 글자라
 * 굵기·크기·수직 정렬이 기기마다 달라졌다.
 */
function Chevron({ direction }: { direction: 'left' | 'right' | 'down' }) {
  return (
    <svg
      viewBox="0 0 8 14"
      className={cn(
        'h-3.5 w-2 transition-transform',
        // 아래 방향은 같은 도형을 90도 돌려 쓴다 — 획 굵기가 어긋나지 않는다
        direction === 'down' && 'rotate-90',
      )}
      fill="none"
      aria-hidden
    >
      <path
        d={direction === 'left' ? 'M7 1L1 7l6 6' : 'M1 1l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 이동 버튼. 글자 크기에 눌려 좁던 터치 영역을 정사각으로 넓힌다 —
 * 캘린더에서 가장 자주 눌리는 자리라 빗나가면 다른 날짜가 선택된다.
 */
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
      className="bg-surface-elevated rounded-sm text-text-secondary hover:text-text-primary flex size-8 items-center justify-center transition-colors active:opacity-60"
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
      {/*
        3열 격자다. justify-between으로 두면 `오늘` 버튼이 나타날 때 오른쪽이 넓어지면서
        가운데 월 표시가 왼쪽으로 밀린다 — 날짜를 옮길 때마다 제목이 흔들려 보인다.
        양옆을 1fr로 같게 잡으면 가운데는 버튼 유무와 무관하게 제자리에 있는다.
      */}
      <header className="grid grid-cols-[1fr_auto_1fr] items-center">
        {/* 격자 칸이 1fr이라 감싸지 않으면 버튼이 칸 너비만큼 늘어난다 */}
        <div className="flex justify-start">
          <IconButton label={mode === 'week' ? '이전 주' : '이전 달'} onClick={() => move(-1)}>
            <Chevron direction="left" />
          </IconButton>
        </div>

        <button
          type="button"
          onClick={() => onModeChange(mode === 'week' ? 'month' : 'week')}
          className="rounded-sm hover:bg-surface-elevated flex items-center gap-2.5 px-2 py-1 transition-colors active:opacity-60"
          aria-expanded={mode === 'month'}
          aria-label={mode === 'week' ? '월 단위로 보기' : '주 단위로 보기'}
        >
          <span className="typo-section">
            {mode === 'week' ? formatShortMonthLabel(anchor) : formatMonthLabel(anchor)}
          </span>
          {/* 펼쳐지면 위를 가리킨다 — 다시 누르면 접힌다는 뜻이다 */}
          <span
            className={cn(
              'text-text-secondary transition-transform',
              mode === 'month' && 'rotate-180',
            )}
          >
            <Chevron direction="down" />
          </span>
        </button>

        <div className="flex items-center justify-end gap-1">
          {showTodayButton && (
            <button
              type="button"
              onClick={() => {
                onAnchorChange(today);
                onSelect(today);
              }}
              className="bg-surface-elevated rounded-sm typo-caption text-text-secondary hover:text-text-primary flex h-8 items-center px-2.5 transition-colors active:opacity-60"
            >
              오늘
            </button>
          )}
          <IconButton label={mode === 'week' ? '다음 주' : '다음 달'} onClick={() => move(1)}>
            <Chevron direction="right" />
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

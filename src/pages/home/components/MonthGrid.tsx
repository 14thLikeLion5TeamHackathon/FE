import { DOW_LABELS, monthMatrix, toKey } from '../../../lib/date';
import DayCell from './DayCell';

type MonthGridProps = {
  anchor: Date;
  selected: Date;
  markedKeys: Set<string>;
  outOfForecastKeys: Set<string>;
  onSelect: (date: Date) => void;
};

/** 6주 × 7일 고정. 그 달이 아닌 칸은 비워 둔다(이전/다음 달 날짜를 흐리게 보여주지 않는다). */
export default function MonthGrid({
  anchor,
  selected,
  markedKeys,
  outOfForecastKeys,
  onSelect,
}: MonthGridProps) {
  return (
    <div className="bg-surface-raised rounded-md flex flex-col gap-1 px-1 py-2">
      <div className="grid grid-cols-7 gap-1">
        {DOW_LABELS.map((dow) => (
          <span key={dow} className="typo-caption text-text-secondary flex-1 text-center">
            {dow}
          </span>
        ))}
      </div>

      {monthMatrix(anchor).map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1">
          {week.map((date, di) =>
            date ? (
              <DayCell
                key={toKey(date)}
                date={date}
                selected={toKey(date) === toKey(selected)}
                marked={markedKeys.has(toKey(date))}
                outOfForecast={outOfForecastKeys.has(toKey(date))}
                onSelect={onSelect}
              />
            ) : (
              <span key={`blank-${wi}-${di}`} aria-hidden />
            ),
          )}
        </div>
      ))}
    </div>
  );
}

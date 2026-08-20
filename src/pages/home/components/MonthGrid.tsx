import { DOW_LABELS, monthMatrix, toKey } from '../../../lib/date';
import DayCell from './DayCell';

type MonthGridProps = {
  anchor: Date;
  selected: Date;
  markedKeys: Set<string>;
  outOfForecastKeys: Set<string>;
  /** 이 날짜 이전은 고를 수 없다. 경계를 모르면 null이고, 그때는 아무것도 막지 않는다 */
  minDate?: Date | null;
  onSelect: (date: Date) => void;
};

/** 6주 × 7일 고정. 그 달이 아닌 칸은 비워 둔다(이전/다음 달 날짜를 흐리게 보여주지 않는다). */
export default function MonthGrid({
  anchor,
  selected,
  markedKeys,
  outOfForecastKeys,
  minDate,
  onSelect,
}: MonthGridProps) {
  return (
    <div className="bg-surface-raised rounded-md flex flex-col gap-1 px-1 py-2">
      {/*
        요일 줄은 날짜와 **다른 층으로 읽혀야 한다.** 같은 간격·같은 톤으로 붙어 있으면
        6주 격자의 첫 줄처럼 보여서, 1일이 무슨 요일인지 세다가 한 칸씩 어긋난다.
        아래 여백과 옅은 선으로 떼어 놓고, 색도 날짜보다 한 단 낮춘다.
      */}
      <div className="border-border-subtle mb-1.5 grid grid-cols-7 gap-1 border-b pb-2.5">
        {DOW_LABELS.map((dow) => (
          <span key={dow} className="typo-caption text-text-tertiary flex-1 text-center">
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
                disabled={minDate ? date < minDate : false}
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

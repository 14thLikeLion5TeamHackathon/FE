import { toKey, weekDays } from '../../../lib/date';
import DayCell from './DayCell';

type WeekStripProps = {
  /** 이 날짜가 속한 주를 보여준다 */
  anchor: Date;
  selected: Date;
  markedKeys: Set<string>;
  outOfForecastKeys: Set<string>;
  onSelect: (date: Date) => void;
};

export default function WeekStrip({
  anchor,
  selected,
  markedKeys,
  outOfForecastKeys,
  onSelect,
}: WeekStripProps) {
  return (
    <div className="bg-surface-raised rounded-md grid grid-cols-7 gap-1 px-1 py-2">
      {weekDays(anchor).map((date) => {
        const key = toKey(date);
        return (
          <DayCell
            key={key}
            date={date}
            showDow
            selected={key === toKey(selected)}
            marked={markedKeys.has(key)}
            outOfForecast={outOfForecastKeys.has(key)}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}

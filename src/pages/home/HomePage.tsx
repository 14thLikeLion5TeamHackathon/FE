import { useMemo, useState } from 'react';

import PageHeader from '../../components/PageHeader';
import { useToday, useToggleChecklistItem } from '../../hooks/today/useToday';
import { useTodayLocation } from '../../hooks/today/useTodayLocation';
import { startOfDay, toKey } from '../../lib/date';
import CalendarNav from './components/CalendarNav';
import CareBriefing from './components/CareBriefing';
import CareEvidence from './components/CareEvidence';
import LocationPicker from './components/LocationPicker';
import TodayChecklist from './components/TodayChecklist';

/**
 * 오늘 탭.
 *
 * 블록 순서는 **왜 → 무엇 → 근거**다.
 * 캘린더로 날짜를 고르면 브리핑이 그 날짜 기준으로 갱신되고,
 * 매일 여는 이유인 체크리스트가 근거보다 위에 온다.
 */
export default function HomePage() {
  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const [anchor, setAnchor] = useState(selected);
  const [mode, setMode] = useState<'week' | 'month'>('week');

  const { coords, regionId, label, isLocating, gpsDenied, selectRegion } = useTodayLocation();

  const { data, isLoading, isError } = useToday(toKey(selected), coords);
  const { mutate: toggleItem } = useToggleChecklistItem(toKey(selected), coords);

  /** 마킹·예보범위는 날짜 키 조회라 Set으로 바꿔 둔다 */
  const { markedKeys, outOfForecastKeys } = useMemo(() => {
    const marked = new Set<string>();
    const outOfForecast = new Set<string>();
    for (const day of data?.calendar ?? []) {
      if (day.marked) marked.add(day.date);
      if (day.outOfForecast) outOfForecast.add(day.date);
    }
    return { markedKeys: marked, outOfForecastKeys: outOfForecast };
  }, [data]);

  const handleSelect = (date: Date) => {
    setSelected(date);
    setAnchor(date);
  };

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <PageHeader title="오늘" />

      <LocationPicker
        label={label}
        regionId={regionId}
        isLocating={isLocating}
        gpsDenied={gpsDenied}
        onSelect={selectRegion}
      />

      <CalendarNav
        anchor={anchor}
        selected={selected}
        mode={mode}
        markedKeys={markedKeys}
        outOfForecastKeys={outOfForecastKeys}
        forecastNote={data?.forecastNote}
        onAnchorChange={setAnchor}
        onSelect={handleSelect}
        onModeChange={setMode}
      />

      {(isLocating || isLoading) && (
        <div className="flex flex-col gap-3.5" aria-busy="true">
          <div className="bg-surface-raised rounded-md h-24 animate-pulse" />
          <div className="bg-surface-raised rounded-md h-40 animate-pulse" />
        </div>
      )}

      {isError && <p className="typo-body text-text-secondary">오늘 정보를 불러오지 못했어요.</p>}

      {data && (
        <>
          <CareBriefing {...data.briefing} />
          <TodayChecklist
            items={data.checklist}
            onToggle={(itemId, done) => toggleItem({ itemId, done })}
          />
          <CareEvidence {...data.briefing} />
        </>
      )}
    </div>
  );
}

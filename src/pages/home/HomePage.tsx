import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import PageHeader from '../../components/PageHeader';
import {
  forecastEnd,
  useBriefing,
  useChecklist,
  useHasCards,
  useMarkedDates,
  useToggleChecklistItem,
} from '../../hooks/today/useToday';
import { useTodayLocation } from '../../hooks/today/useTodayLocation';
import { formatDayLabel, monthMatrix, startOfDay, toKey } from '../../lib/date';
import { toLevel } from '../../types/today';
import CalendarNav from './components/CalendarNav';
import CareBriefing, {
  CareBriefingError,
  CareBriefingLoading,
  CareBriefingNoForecast,
} from './components/CareBriefing';
import CareEvidence from './components/CareEvidence';
import LocationPicker from './components/LocationPicker';
import TodayChecklist from './components/TodayChecklist';
import TodayEmptyState from './components/TodayEmptyState';

/**
 * 오늘 탭.
 *
 * 블록 순서는 **왜 → 무엇 → 근거**다.
 * 캘린더로 날짜를 고르면 브리핑이 그 날짜 기준으로 갱신되고,
 * 매일 여는 이유인 체크리스트가 근거보다 위에 온다.
 *
 * 서버는 이 화면을 한 응답으로 주지 않는다 — 브리핑과 체크리스트가 별도 엔드포인트고,
 * 체크리스트는 날짜를 받지 않아 항상 오늘 것이다.
 */
export default function HomePage() {
  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const [anchor, setAnchor] = useState(selected);
  const [mode, setMode] = useState<'week' | 'month'>('week');

  const navigate = useNavigate();
  const { location, selectLocation } = useTodayLocation();

  const hasCards = useHasCards();
  const briefing = useBriefing(toKey(selected), location);
  const checklist = useChecklist();
  const { mutate: toggleItem } = useToggleChecklistItem();

  /** 점은 보이는 달 전체를 한 번에 받아 둔다 — 날짜를 옮길 때마다 다시 부르지 않으려고 */
  const [monthStart, monthEnd] = useMemo(() => {
    const days = monthMatrix(anchor)
      .flat()
      .filter((day): day is Date => day !== null);
    return [toKey(days[0]), toKey(days[days.length - 1])];
  }, [anchor]);
  const markedKeys = useMarkedDates(
    monthStart,
    monthEnd,
    briefing.data?.calendarConnected ?? false,
  );

  /** 예보 범위 밖은 흐리게. 서버가 범위를 주지 않아 오늘부터 5일로 계산한다 */
  const { outOfForecastKeys, forecastNote } = useMemo(() => {
    const last = forecastEnd(startOfDay(new Date()));
    const keys = new Set<string>();
    for (const day of monthMatrix(anchor).flat()) {
      if (day && day > last) keys.add(toKey(day));
    }
    return {
      outOfForecastKeys: keys,
      forecastNote: `예보는 ${last.getMonth() + 1}월 ${last.getDate()}일까지 제공돼요`,
    };
  }, [anchor]);

  const handleSelect = (date: Date) => {
    setSelected(date);
    setAnchor(date);
  };

  const data = briefing.data;

  /** 카드를 하나도 안 만든 사용자에게만 빈 상태를 띄운다 (`useHasCards` 주석 참고) */
  const isEmpty = hasCards === false;

  const dateLabel = formatDayLabel(selected);

  /** 예보 범위 밖이면 날씨·대기질 대신 D-day 기준으로만 안내한다 */
  const isOutOfForecast = selected > forecastEnd(startOfDay(new Date()));

  const metrics = data
    ? [
        {
          label: '자외선',
          value: data.environment.uv.level,
          level: toLevel(data.environment.uv.level),
        },
        {
          label: '미세먼지',
          value: data.environment.dust.level,
          level: toLevel(data.environment.dust.level),
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <PageHeader title="오늘" />

      <LocationPicker location={location} onSelect={selectLocation} />

      {/* 빈 상태에서는 캘린더를 감춘다 — 어느 날짜를 골라도 보여줄 게 없다 (시안 `카드 없음`) */}
      {!isEmpty && (
        <CalendarNav
          anchor={anchor}
          selected={selected}
          mode={mode}
          markedKeys={markedKeys}
          outOfForecastKeys={outOfForecastKeys}
          forecastNote={forecastNote}
          onAnchorChange={setAnchor}
          onSelect={handleSelect}
          onModeChange={setMode}
        />
      )}

      {briefing.isLoading && <CareBriefingLoading dateLabel={dateLabel} />}

      {briefing.isError && (
        <CareBriefingError dateLabel={dateLabel} onRetry={() => void briefing.refetch()} />
      )}

      {isEmpty && (
        <TodayEmptyState
          showCalendar={!data?.calendarConnected}
          onConnectCalendar={() => navigate('/my')}
          onCreateCard={() => navigate('/cards/new')}
        />
      )}

      {data && !isEmpty && (
        <>
          {isOutOfForecast ? (
            <CareBriefingNoForecast dateLabel={dateLabel} />
          ) : (
            <CareBriefing
              dateLabel={dateLabel}
              weather={data.weather && `${data.weather.condition} ${Math.round(data.weather.temp)}°`}
              /* 회복 기간이 끝난 날짜는 판단이 비어 온다. 시안에 없는 문구라 확인 필요 */
              message={
                data.cardJudgement?.actionSentence ??
                '이 날짜에 예정된 회복 관리는 없어요. 평소 루틴을 유지하시면 돼요.'
              }
            />
          )}

          {checklist.data && (
            <TodayChecklist
              items={checklist.data.items}
              onToggle={(checklistId, completed) => toggleItem({ checklistId, completed })}
            />
          )}

          <CareEvidence
            metrics={metrics}
            evidence={(data.cardJudgement?.reasons ?? []).map((label) => ({ label }))}
            schedules={data.schedules.map((schedule) => ({
              id: schedule.scheduleId,
              title: schedule.title,
              time: schedule.time,
              place: schedule.location,
            }))}
          />
        </>
      )}
    </div>
  );
}

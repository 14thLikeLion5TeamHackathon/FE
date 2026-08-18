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
import { useTodayGeolocation } from '../../hooks/today/useTodayGeolocation';
import { useTodayLocation } from '../../hooks/today/useTodayLocation';
import { useWeather } from '../../hooks/weather/useWeather';
import { formatDayLabel, monthMatrix, startOfDay, toKey } from '../../lib/date';
import { toLevel } from '../../types/today';
import CalendarNav from './components/CalendarNav';
import CareBriefing, {
  CareBriefingError,
  CareBriefingLoading,
  CareBriefingNoForecast,
} from './components/CareBriefing';
import CareEvidence from './components/CareEvidence';
import LocationNotice from './components/LocationNotice';
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
 * 서버는 이 화면을 한 응답으로 주지 않는다 — 브리핑과 체크리스트가 별도 엔드포인트라
 * 고른 날짜를 양쪽에 각각 실어 보낸다.
 */
export default function HomePage() {
  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const [anchor, setAnchor] = useState(selected);
  const [mode, setMode] = useState<'week' | 'month'>('week');

  const navigate = useNavigate();
  const { location, selectLocation } = useTodayLocation();
  // 좌표는 아직 조회에 쓰지 않는다(서버 수용 여부 문의 중) — 상태만 화면에 비춘다
  const { status: geoStatus } = useTodayGeolocation();

  const hasCards = useHasCards();
  const selectedKey = toKey(selected);
  const briefing = useBriefing(selectedKey, location);
  const checklist = useChecklist(selectedKey);
  const { mutate: toggleItem } = useToggleChecklistItem();

  /** 일정은 보이는 달 전체를 한 번에 받아 둔다 — 날짜를 옮길 때마다 다시 부르지 않으려고 */
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

  /** 오늘 날짜는 한 번만 구해 공유한다 — 곳곳에서 new Date()를 부르면 서로 어긋난다 */
  const today = useMemo(() => startOfDay(new Date()), []);

  /** 예보 범위 밖은 흐리게. 서버가 범위를 주지 않아 오늘부터 5일로 계산한다 */
  const { outOfForecastKeys, forecastNote } = useMemo(() => {
    const last = forecastEnd(today);
    const keys = new Set<string>();
    for (const day of monthMatrix(anchor).flat()) {
      if (day && day > last) keys.add(toKey(day));
    }
    return {
      outOfForecastKeys: keys,
      forecastNote: `예보는 ${last.getMonth() + 1}월 ${last.getDate()}일까지 제공돼요`,
    };
  }, [anchor, today]);

  const handleSelect = (date: Date) => {
    setSelected(date);
    setAnchor(date);
  };

  const data = briefing.data;

  /** 카드를 하나도 안 만든 사용자에게만 빈 상태를 띄운다 (`useHasCards` 주석 참고) */
  const isEmpty = hasCards === false;

  const dateLabel = formatDayLabel(selected);

  /** 예보 범위 밖이면 날씨·대기질 대신 D-day 기준으로만 안내한다 */
  const isOutOfForecast = selected > forecastEnd(today);

  /**
   * 날씨·환경 지표. 브리핑과 나눠 받는다 — 한쪽이 실패해도 다른 쪽은 보인다.
   * 예보 범위 밖은 부르지 않는다. 서버가 400을 내는데 그건 오류가 아니라
   * "아직 예보가 없다"는 정상 상태라, 요청 자체를 안 하는 편이 맞다.
   */
  const weather = useWeather(selectedKey, location, !isOutOfForecast);

  // 예보 범위 밖에서는 비운다 — 브리핑이 "예보가 없어요"라고 말하는데
  // 바로 아래에 자외선·미세먼지 값이 그대로 보이면 서로 어긋난다.
  const metrics =
    weather.data && !isOutOfForecast
      ? [
        weather.data.uvLevel && {
          label: '자외선',
          value: weather.data.uvLevel,
          level: toLevel(weather.data.uvLevel),
        },
        weather.data.dustLevel && {
          label: '미세먼지',
          value: weather.data.dustLevel,
          level: toLevel(weather.data.dustLevel),
        },
        ].filter((metric) => metric !== null && metric !== '')
      : [];

  const evidence = (data?.cardJudgement?.reasons ?? []).map((label) => ({ label }));

  const schedules = (data?.schedules ?? []).map((schedule) => ({
    id: schedule.scheduleId,
    title: schedule.title,
    time: schedule.time,
    place: schedule.location,
  }));

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <PageHeader title="오늘" />

      {/* 좁은 화면에서는 안내가 길어 줄이 넘친다 — 접히게 두고 세로 간격만 좁게 준다 */}
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <LocationPicker location={location} onSelect={selectLocation} />
        <LocationNotice status={geoStatus} location={location} />
      </div>

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

      {/* 상태 넷은 반드시 하나만 뜬다. 따로 두면 카드 조회와 브리핑이 병렬이라
          로딩 카드와 빈 화면이 겹쳐 뜨고, 재조회가 실패하면 직전 데이터가 남아 있어
          에러 카드와 정상 브리핑이 같이 보인다. */}
      {isEmpty ? (
        <TodayEmptyState
          /* 연동 여부를 아직 모르는 동안은 감춘다 — 이미 연동한 사람에게 연동하라고 하지 않으려고 */
          showCalendar={data ? !data.calendarConnected : false}
          onConnectCalendar={() => navigate('/my')}
          onCreateCard={() => navigate('/cards/new')}
        />
      ) : briefing.isError && !data ? (
        <CareBriefingError dateLabel={dateLabel} onRetry={() => void briefing.refetch()} />
      ) : !data ? (
        <CareBriefingLoading dateLabel={dateLabel} />
      ) : (
        <>
          {isOutOfForecast ? (
            <CareBriefingNoForecast dateLabel={dateLabel} />
          ) : (
            <CareBriefing
              dateLabel={dateLabel}
              /* 날씨는 브리핑이 아니라 전용 API에서 받는다 — 한쪽이 실패해도 다른 쪽은 보인다 */
              weather={
                weather.data?.temp !== null && weather.data?.temp !== undefined
                  ? `${weather.data.condition ?? ''} ${Math.round(weather.data.temp)}°`.trim()
                  : null
              }
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

          {/* 셋 다 비면 제목만 남은 빈 상자가 된다. 근거가 없으면 블록째 감춘다 */}
          {(metrics.length > 0 || evidence.length > 0 || schedules.length > 0) && (
            <CareEvidence metrics={metrics} evidence={evidence} schedules={schedules} />
          )}
        </>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import PageHeader from '../../components/PageHeader';
import {
  forecastEnd,
  useBriefing,
  useCalendarEvents,
  useCareStartDate,
  useChecklist,
  useRecoveryGap,
  useHasCards,
  useMarkedDates,
  useToggleChecklistItem,
} from '../../hooks/today/useToday';
import { useTodayLocation } from '../../hooks/today/useTodayLocation';
import { useWeather } from '../../hooks/weather/useWeather';
import {
  formatDayLabel,
  formatShortDayLabel,
  fromDateInputValue,
  monthMatrix,
  startOfDay,
  toKey,
  weekDays,
} from '../../lib/date';
import { syncScheduleDate } from '../../lib/scheduleDates';
import { eventDateKey, eventTimeLabel, eventTitle, toLevel } from '../../types/today';
import CalendarNav from './components/CalendarNav';
import CareBriefing, {
  CareBriefingError,
  CareBriefingGap,
  CareBriefingLoading,
  CareBriefingNoForecast,
} from './components/CareBriefing';
import CareEvidence from './components/CareEvidence';
import LocationNotice from './components/LocationNotice';
import LocationPicker from './components/LocationPicker';
import TodayChecklist from './components/TodayChecklist';
import Skeleton from '../../components/Skeleton';
import TodayEmptyState from './components/TodayEmptyState';
import TodayEnvironment from './components/TodayEnvironment';
import TodaySchedules from './components/TodaySchedules';
import type { Schedule } from '../../types/schedule';

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
  // 기준 좌표는 GPS와 직접 선택 중 하나로 정해진다 — 규칙은 useTodayLocation 주석 참고
  const { location, selectLocation, coords, usingGps, geoStatus, gpsCoords, useCurrentLocation: resetToGps } = useTodayLocation();

  /** 오늘 날짜는 한 번만 구해 공유한다 — 곳곳에서 new Date()를 부르면 서로 어긋난다 */
  const today = useMemo(() => startOfDay(new Date()), []);

  /**
   * 날씨·대기질을 붙일 수 없는 날짜면 D-day 기준으로만 안내한다.
   * 조회를 막는 조건이라 쿼리보다 위에 있어야 한다.
   *
   * **막는 건 앞날뿐이다.** 예보는 오늘부터 5일이라 그 뒤는 서버에 아직 값이 없다.
   * 지난 날짜는 다르다 — 그날의 날씨가 DB에 남아 있어서 물어보면 답이 온다.
   * 한때 지난 날짜도 여기 묶어 요청 자체를 막았는데, 그러면 서버가 줄 수 있는 브리핑을
   * 우리가 안 받아놓고 "예보가 없어요"라고 말하게 된다.
   */
  const isPast = selected < today;
  const isOutOfForecast = selected > forecastEnd(today);

  const hasCards = useHasCards();

  /**
   * 안내가 시작되는 날. 이 날 이전은 캘린더에서 고를 수 없다 —
   * 카드가 없던 때라 브리핑도 체크리스트도 생길 수가 없다(useCareStartDate 주석).
   */
  const careStart = useCareStartDate();

  /**
   * 회복 구간 밖이면 지금이 어디쯤인지. 구간 안이면 null이고, 그때 할 말은 서버 몫이다.
   * 카드 목록으로 계산하므로 브리핑이 없어도 답이 나온다(useRecoveryGap 주석).
   */
  const recoveryGap = useRecoveryGap(selected);

  /**
   * 예보가 없는 날에 대신 붙일 D-day. 그날 회복 중인 카드가 없으면 undefined다 —
   * 그때는 브리핑 문구가 D-day를 약속하지 않는 쪽으로 갈린다(CareBriefingNoForecast).
   */
  const ddayNote =
    recoveryGap?.kind === 'active'
      ? { treatmentName: recoveryGap.treatmentName, label: `D+${recoveryGap.dday}` }
      : undefined;
  const selectedKey = toKey(selected);
  const briefing = useBriefing(selectedKey, location, !isOutOfForecast);
  const checklist = useChecklist(selectedKey);
  const { mutate: toggleItem } = useToggleChecklistItem();

  /** 일정은 보이는 달 전체를 한 번에 받아 둔다 — 날짜를 옮길 때마다 다시 부르지 않으려고 */
  const [monthStart, monthEnd] = useMemo(() => {
    const days = monthMatrix(anchor)
      .flat()
      .filter((day): day is Date => day !== null);
    return [toKey(days[0]), toKey(days[days.length - 1])];
  }, [anchor]);

  const markedKeys = useMarkedDates(monthStart, monthEnd);

  /** 캘린더 점과 같은 쿼리다 — 키가 같아 요청은 한 번만 나간다(useCalendarEvents 주석) */
  const calendarEvents = useCalendarEvents(monthStart, monthEnd);

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

  /**
   * 못 고르는 칸이 지금 화면에 있을 때만 이유를 말한다.
   * 흐린 칸이 하나도 안 보이는데 설명만 뜨면 무엇을 가리키는 말인지 알 수 없다.
   */
  const startNote = useMemo(() => {
    if (!careStart) return null;

    const visible = mode === 'week' ? weekDays(anchor) : monthMatrix(anchor).flat().filter(Boolean);
    const hasBlocked = visible.some((day) => day !== null && day < careStart);
    if (!hasBlocked) return null;

    return `${careStart.getMonth() + 1}월 ${careStart.getDate()}일 시술 이전은 안내가 없어요`;
  }, [anchor, careStart, mode]);

  const handleSelect = (date: Date) => {
    setSelected(date);
    setAnchor(date);
  };

  const data = briefing.data;

  /** 카드를 하나도 안 만든 사용자에게만 빈 상태를 띄운다 (`useHasCards` 주석 참고) */
  const isEmpty = hasCards === false;

  const dateLabel = formatDayLabel(selected);

  /**
   * 블록 제목에 끼워 쓸 날짜. **오늘이면 undefined다.**
   *
   * 오늘을 보고 있을 때까지 "8월 20일 케어"라고 쓰면 매일 여는 화면이 낯설어진다 —
   * 오늘은 "오늘"이라고 부르는 게 맞다. 다른 날짜일 때만 날짜로 바꿔 어느 날 얘기인지 밝힌다.
   */
  const blockDateLabel = selectedKey === toKey(today) ? undefined : formatShortDayLabel(selected);

  /** 체크리스트는 브리핑과 별개 엔드포인트라 브리핑이 죽어도 온다 (아래 렌더 주석 참고) */
  const checklistItems = checklist.data?.items ?? [];

  /**
   * 날씨·환경 지표. 브리핑과 나눠 받는다 — 한쪽이 실패해도 다른 쪽은 보인다.
   * 예보 범위 밖은 부르지 않는다. 서버가 400을 내는데 그건 오류가 아니라
   * "아직 예보가 없다"는 정상 상태라, 요청 자체를 안 하는 편이 맞다.
   */
  const weather = useWeather(selectedKey, coords, !isOutOfForecast);

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

  /** "온흐림 28°" — 기온이 없으면 문구를 만들지 않는다 */
  const weatherText =
    weather.data?.temp !== null && weather.data?.temp !== undefined
      ? `${weather.data.condition ?? ''} ${Math.round(weather.data.temp)}°`.trim()
      : null;

  const evidence = (data?.cardJudgement?.reasons ?? []).map((label) => ({ label }));

  /**
   * 일정 목록을 모르는 상태인지. 일정은 브리핑에 실려 오므로 브리핑이 없으면 알 수 없다.
   * 빈 배열로 넘기면 "등록한 일정이 없어요"라고 단정하게 된다 — 모르는 건 모른다고 말한다.
   */
  /**
   * 직접 입력한 일정을 못 받은 상태. **아직 받는 중인 건 여기 넣지 않는다** —
   * 로딩이 "불러올 수 없어요"로 새어 나가면 잠깐이라도 실패로 읽힌다(TodaySchedules).
   */
  const briefingLoading = !data && briefing.isLoading;
  const briefingUnavailable = isOutOfForecast || (!data && !briefingLoading);

  /**
   * 제목 없는 일정은 버린다 — 시간만 있는 빈 줄은 목록에서 아무 뜻이 없다.
   *
   * 수정 화면이 그대로 쓸 수 있게 `Schedule` 모양으로 맞춘다. 단건 조회 API가 서버에 없어서
   * 이 값을 라우터 state로 넘겨야 수정 화면이 열린다(api/schedule.ts 주석 참고).
   *
   * `editable`은 **모르는 채로 true를 준다.** 브리핑 응답에 출처 필드가 없어 캘린더에서
   * 가져온 일정과 직접 입력한 일정을 구분할 방법이 없다. 전부 열어두고, 서버가 거절하면
   * 그때 안내한다 — 직접 입력한 일정까지 막아버리는 쪽이 손해가 크다고 봤다.
   */
  const manualSchedules: Schedule[] = (data?.schedules ?? []).flatMap((schedule) =>
    schedule.title
      ? [
          {
            id: String(schedule.scheduleId),
            title: schedule.title,
            date: fromDateInputValue(selectedKey),
            time: schedule.time ?? null,
            place: schedule.location ?? null,
            editable: true,
          },
        ]
      : [],
  );

  /**
   * 브리핑이 온 김에 그 날짜의 사실을 기억해 둔다 — 캘린더 점의 근거가 된다.
   *
   * 직접 입력한 일정은 날짜 범위로 물을 방법이 없어서 넣을 때 기억해 두는데(useSchedule),
   * 그것만으로는 다른 기기에서 넣은 일정을 모른다. 날짜를 열어볼 때마다 여기서 메운다.
   * 지운 일정도 이 경로로 사라진다 — 삭제 후 브리핑을 다시 받으면 빈 목록이 온다.
   *
   * 브리핑을 못 받은 날짜는 건드리지 않는다. 모르는 걸 "없다"로 저장하면 멀쩡한 점이 지워진다.
   */
  useEffect(() => {
    if (!data) return;
    syncScheduleDate(selectedKey, (data.schedules ?? []).length > 0);
  }, [data, selectedKey]);

  /**
   * 연동된 구글 캘린더 일정 중 고른 날짜의 것.
   *
   * 브리핑의 `schedules`에는 직접 입력한 일정만 온다 — 연동해 둔 사용자는 캘린더에 점만
   * 찍히고 목록은 비어 있어서, 일정이 있는 날인데 "등록한 일정이 없어요"를 읽게 됐다.
   *
   * 이쪽은 **`editable: false`다.** 이 응답은 구글 일정만 담는다.
   *
   * 겹칠 걱정은 없다 — 서버는 구글 일정을 저장하지 않고 조회할 때마다 구글에서 받아온다.
   * 브리핑은 저장된 일정 표만 읽으므로 거기 담기는 건 직접 입력한 것뿐이다(BE 확인, #111).
   */
  const eventSchedules: Schedule[] = (calendarEvents.data ?? []).flatMap((event, index) => {
    if (eventDateKey(event) !== selectedKey) return [];

    const title = eventTitle(event);
    if (!title) return []; // 제목 없는 줄은 목록에서 아무 뜻이 없다 — 직접 입력 쪽과 같은 규칙

    return [
      {
        /*
          순번을 쓴다. 응답의 `scheduleId`는 저장된 식별자가 아니라 그 응답 안에서 1부터
          세는 값이라 요청마다 다른 일정에 같은 번호가 붙는다(BE 확인). 어차피 수정하지
          않으므로 목록 key로만 쓰인다.
        */
        id: `calendar-${index}`,
        title,
        date: fromDateInputValue(selectedKey),
        time: eventTimeLabel(event),
        place: event.location ?? null,
        editable: false,
      },
    ];
  });

  /** 종일(시간 없음)을 위로. 나머지는 시각순 — 시간이 뒤죽박죽이면 목록을 훑을 수 없다 */
  const schedules: Schedule[] = [...manualSchedules, ...eventSchedules].sort((a, b) =>
    (a.time ?? '').localeCompare(b.time ?? ''),
  );

  /** 고른 날짜를 넘겨 추가 화면의 날짜칸을 채운다 — 안 넘기면 매번 다시 고르게 된다 */
  const handleAddSchedule = () =>
    navigate('/schedules/new', { state: { date: fromDateInputValue(selectedKey) } });

  const handleEditSchedule = (schedule: Schedule) =>
    navigate(`/schedules/${schedule.id}/edit`, { state: { schedule } });

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <PageHeader title="오늘" />

      {/* 좁은 화면에서는 안내가 길어 줄이 넘친다 — 접히게 두고 세로 간격만 좁게 준다 */}
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {/* selectLocation은 서버 저장을 기다리는 비동기다 — 시트는 즉시 닫히고, 결과는 브리핑 재조회로 드러난다 */}
        <LocationPicker
          location={location}
          onSelect={(next) => void selectLocation(next)}
          usingGps={usingGps}
          gpsCoords={gpsCoords}
          geoStatus={geoStatus}
          onUseCurrentLocation={() => void resetToGps()}
        />
        <LocationNotice status={geoStatus} location={location} usingGps={usingGps} />
      </div>

      {/* 빈 상태에서는 캘린더를 감춘다 — 어느 날짜를 골라도 보여줄 게 없다 (시안 `카드 없음`) */}
      {!isEmpty && (
        <CalendarNav
          anchor={anchor}
          selected={selected}
          mode={mode}
          markedKeys={markedKeys}
          outOfForecastKeys={outOfForecastKeys}
          minDate={careStart}
          forecastNote={forecastNote}
          startNote={startNote}
          onAnchorChange={setAnchor}
          onSelect={handleSelect}
          onModeChange={setMode}
        />
      )}

      {/* 브리핑 카드는 상태 넷 중 하나만 뜬다. 따로 두면 카드 조회와 브리핑이 병렬이라
          로딩 카드와 빈 화면이 겹쳐 뜨고, 재조회가 실패하면 직전 데이터가 남아 있어
          에러 카드와 정상 브리핑이 같이 보인다. */}
      {isOutOfForecast ? (
        /* 예보 범위 밖은 오류가 아니라 정상 상태다 — 로딩·에러보다 먼저 잡아야
           서버가 내는 400이 "불러오지 못했어요"로 새어 나가지 않는다 */
        <CareBriefingNoForecast
          dateLabel={dateLabel}
          past={false}
          dday={ddayNote}
          onRefresh={() => void briefing.refetch()}
          isRefreshing={briefing.isFetching}
        />
      ) : isPast && briefing.isError && !data ? (
        /*
          지난 날짜는 물어보되, 실패하면 오류라고 말하지 않는다.
          그날 날씨가 DB에 없는 날도 있어서 400이 올 수 있는데, 사용자에게는 앱이 고장난
          것과 구분되지 않는다 — 이미 지나간 날이라 다시 시도해도 달라질 게 없으므로
          "그날은 안내가 없어요"로 받는다. 오늘·앞날은 그대로 오류 카드를 띄운다.
        */
        recoveryGap && recoveryGap.kind !== 'active' ? (
          /*
            지난 날짜라 브리핑을 못 받았어도, 그날 회복 중인 카드가 없었다는 건 카드 목록만으로
            안다. "안내가 없어요"보다 왜 없는지를 말하는 편이 낫다.

            여기엔 새로고침을 붙이지 않는다 — 이 카드는 브리핑이 아니라 카드 목록에서
            계산된 내용이라 다시 불러도 달라질 게 없다.
          */
          <CareBriefingGap
            dateLabel={dateLabel}
            weather={weatherText}
            kind={recoveryGap.kind}
            treatmentName={recoveryGap.treatmentName}
            dateText={formatShortDayLabel(recoveryGap.date)}
            onCreateCard={() => navigate('/cards/new')}
          />
        ) : (
          <CareBriefingNoForecast
            dateLabel={dateLabel}
            past
            dday={ddayNote}
            onRefresh={() => void briefing.refetch()}
            isRefreshing={briefing.isFetching}
          />
        )
      ) : isEmpty ? (
        <>
          {/*
            카드가 없어도 날씨·자외선·미세먼지는 그대로 유효하다. 이걸 감추면 화면에
            안내 상자 두 개만 남아 앱이 아무것도 안 하는 것처럼 보인다 —
            오늘을 알려주는 화면은 그대로 두고, 그 아래에 카드를 만들라고 권한다.
          */}
          <TodayEnvironment dateLabel={dateLabel} weather={weatherText} />
          {metrics.length > 0 && (
            <CareEvidence
              title={blockDateLabel ? `${blockDateLabel} 환경` : '오늘의 환경'}
              metrics={metrics}
              evidence={[]}
            />
          )}
          {/* 일정은 케어 카드와 무관하다 — 카드가 없어도 넣고 볼 수 있어야 한다 */}
          <TodaySchedules
            schedules={schedules}
            dateLabel={blockDateLabel}
            onAdd={handleAddSchedule}
            onEdit={handleEditSchedule}
          />
          <TodayEmptyState
            /* 브리핑이 오기 전에는 연동 여부를 모른다 — null로 넘겨 감춘다 */
            calendarConnected={data ? (data.calendarConnected ?? null) : null}
            onConnectCalendar={() => navigate('/my')}
            onCreateCard={() => navigate('/cards/new')}
          />
        </>
      ) : briefing.isError && !data ? (
        <CareBriefingError dateLabel={dateLabel} onRetry={() => void briefing.refetch()} />
      ) : !data ? (
        <CareBriefingLoading dateLabel={dateLabel} />
      ) : !data.cardJudgement && recoveryGap && recoveryGap.kind !== 'active' ? (
        /*
          서버가 판단을 못 준 건 그 날짜에 진행 중인 카드가 없어서다. 기본 문구로 얼버무리면
          카드를 만들어 둔 사용자에게 앱이 고장난 것처럼 보인다 — 카드 목록으로 계산한
          맥락을 대신 말한다.
        */
        <CareBriefingGap
          dateLabel={dateLabel}
          weather={weatherText}
          kind={recoveryGap.kind}
          treatmentName={recoveryGap.treatmentName}
          dateText={formatShortDayLabel(recoveryGap.date)}
          onCreateCard={() => navigate('/cards/new')}
        />
      ) : (
        <CareBriefing
          dateLabel={dateLabel}
          /* 날씨는 브리핑이 아니라 전용 API에서 받는다 — 한쪽이 실패해도 다른 쪽은 보인다 */
          weather={weatherText}
          /* 회복 기간이 끝난 날짜는 판단이 비어 온다. 시안에 없는 문구라 확인 필요 */
          message={
            data.cardJudgement?.actionSentence ??
            '이 날짜에 예정된 회복 관리는 없어요. 평소 루틴을 유지하시면 돼요.'
          }
        />
      )}

      {/*
        아래 블록들은 **브리핑 밖에 둔다.**
        예전에는 브리핑 성공 분기 안에 들어 있어서, 브리핑이 500이거나 아직 로딩 중이면
        체크리스트를 200으로 잘 받아놓고도 화면에 그리지 않았다 — 엔드포인트를 나눠 받은
        이유(한쪽이 실패해도 다른 쪽은 보인다)가 렌더 구조에서 무너져 있었다.

        빈 상태만 예외다. 카드가 없으면 체크리스트도 근거도 비어 있고,
        그 화면은 자기 몫의 블록을 위에서 이미 그린다.
      */}
      {!isEmpty && (
        <>
          {/*
            체크리스트는 AI로 문구를 만들어 오느라 브리핑보다 늦게 도착한다.
            자리를 비워두면 화면이 멈춘 것처럼 보이고, 뒤늦게 나타나면서 아래 블록을 밀어낸다.
          */}
          {checklist.isLoading ? (
            <section
              className="bg-surface-raised rounded-md flex flex-col gap-3 p-4"
              aria-busy="true"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="bg-surface-fill h-4 w-20" />
                <Skeleton className="bg-surface-fill h-3 w-10" />
              </div>
              <Skeleton className="bg-surface-fill h-1.5 w-full" />
              <Skeleton className="bg-surface-fill h-4 w-3/4" />
              <Skeleton className="bg-surface-fill h-4 w-2/3" />
              <Skeleton className="bg-surface-fill h-4 w-4/5" />
            </section>
          ) : (
            /*
              항목이 없어도 지난 날짜에서는 블록을 남긴다.
              서버가 지난 날짜의 체크리스트를 주지 않아 빈 목록이 오는데, 그대로 감추면
              그 자리가 아무 설명 없이 비어 사용자는 앱이 날짜를 잊은 줄 안다 —
              바로 아래 일정 블록이 같은 상황에서 "아직 불러올 수 없어요"라고 말하는 것과도 어긋났다.

              오늘·앞날의 빈 목록은 그대로 감춘다. 그쪽은 브리핑이 이미 할 말을 하고 있어
              여기까지 빈 상자를 더하면 같은 얘기가 두 번 나온다.
            */
            (checklistItems.length > 0 || isPast) && (
              <TodayChecklist
                items={checklistItems}
                past={isPast}
                dateLabel={blockDateLabel}
                onToggle={(checklistId, completed) => toggleItem({ checklistId, completed })}
                onRefresh={() => void checklist.refetch()}
                isRefreshing={checklist.isFetching}
              />
            )
          )}

          {/*
            날씨를 붙일 수 없는 날짜는 브리핑을 부르지 않아 일정 목록을 모른다 —
            빈 목록으로 넘기면 "없어요"라고 단정하게 되므로 모른다고 말한다.
            앞날 일정을 넣는 건 가장 흔한 쓰임이라 추가 버튼은 그대로 살려 둔다.
          */}
          <TodaySchedules
            /*
              브리핑이 없어도 캘린더 일정은 안다 — 그건 달 단위로 따로 받기 때문이다.
              통째로 비우면 알고 있는 것까지 감추게 되므로, 아는 만큼은 그대로 보여주고
              "직접 넣은 일정은 아직 모른다"고만 덧붙인다(unavailable).

              브리핑이 없으면 manualSchedules가 비어 schedules는 캘린더 일정만 남는다 —
              따로 갈라 쓸 필요가 없다.
            */
            schedules={schedules}
            unavailable={briefingUnavailable}
            loading={briefingLoading}
            dateLabel={blockDateLabel}
            onAdd={handleAddSchedule}
            onEdit={handleEditSchedule}
          />

          {/* 둘 다 비면 제목만 남은 빈 상자가 된다. 근거가 없으면 블록째 감춘다 */}
          {(metrics.length > 0 || evidence.length > 0) && (
            <CareEvidence metrics={metrics} evidence={evidence} />
          )}
        </>
      )}
    </div>
  );
}

import { useNavigate, useParams } from 'react-router';

import NavHeader from '../../components/NavHeader';
import CareInfo from './components/CareInfo';
import TodayCare from './components/TodayCare';
import RecoveryGuide from './components/RecoveryGuide';
import Cautions from './components/Cautions';
import RecordHeader from './components/RecordHeader';
import RecordCTA from './components/RecordCTA';
import RecordCard from './components/RecordCard';
import StoreGuide from './components/StoreGuide';

import { useCardDetail, useCardRecords } from '../../hooks/card/useCard';
import { NO_TREATMENT_NAME } from '../../types/card';
import { getLocationParams } from '../../lib/location';
import type { GuideStage } from './components/RecoveryGuide';

/** D-Day별 RecordCTA 헬퍼 함수 (7, 14, 21, 29일에만 문구 리턴) */
function getRecordCTASubText(dday: number): string | undefined {
  switch (dday) {
    case 7:
      return 'D+7은 변화가 큰 시점이라 기록을 권해요';
    case 14:
      return 'D+14는 회복 중간 점검 시점이라 기록을 권해요';
    case 21:
      return 'D+21은 피부 정돈이 진행되는 시점이라 기록을 권해요';
    case 29:
      return 'D+29는 최종 경과 확인 시점이라 기록을 권해요';
    default:
      return undefined;
  }
}

// ---------------------------------------------------------------------------
// 회복 가이드 / 주의사항 (#59)
//
// BE는 아직 recoveryGuide·caution 필드를 내려주지 않는다(2026-08-16 실서버 확인,
// GET /api/v1/cards/{cardId} 응답에 두 필드 없음). 그래서 아래 "문구"는 여전히
// FE가 임의로 쓴 카피다 — 실제 서버 데이터가 아니다.
// 다만 예전처럼 D+1~29 구간을 통째로 박아두면 recoveryTotalDays가 10인 카드에서도
// D+15~29 같은 있을 수 없는 구간이 뜬다. 그래서 "며칠짜리 구간인지"는 서버가
// 실제로 내려주는 recoveryTransitionDay(회복 전환점)·recoveryTotalDays(총 회복일)로
// 계산해서, 어떤 카드가 와도 그 카드의 회복 기간을 절대 벗어나지 않게 만든다.
// BE가 recoveryGuide/caution을 배포하면 이 블록은 통째로 지우고 응답 필드로 교체할 것.
// ---------------------------------------------------------------------------

/** 0 미만·total 초과 값을 [1, total] 범위로 눌러준다 (BE 값이 이상해도 화면이 안 깨지게) */
function clampDay(day: number, totalDays: number): number {
  return Math.min(Math.max(day, 1), totalDays);
}

/**
 * 회복 가이드 구간을 recoveryTransitionDay(전환점) 기준 전기/후기 2단계로 만든다.
 * 서버가 주는 "구간 경계"는 이 값 하나뿐이라 4단계를 흉내내지 않고, 실제로 근거가
 * 있는 경계(전환점)로만 나눈다 — 없는 경계를 지어내면 또 하드코딩과 다를 게 없다.
 */
function buildGuideStages(
  recoveryTransitionDay: number,
  recoveryTotalDays: number,
  currentDDay: number,
): GuideStage[] {
  // 총 회복일이 0 이하면 구간을 만들 근거가 없다 — 빈 배열로 안전하게 처리
  if (recoveryTotalDays <= 0) return [];

  const transitionDay = clampDay(recoveryTransitionDay, recoveryTotalDays);
  const stages: GuideStage[] = [];

  // 전기: D+1 ~ 전환일
  stages.push({
    range: transitionDay === 1 ? 'D+1' : `D+1~${transitionDay}`,
    description: '붓기와 붉은기가 두드러지는 초기 회복기예요',
    current: currentDDay >= 1 && currentDDay <= transitionDay,
  });

  // 후기: (전환일+1) ~ 총 회복일. 전환일이 총 회복일과 같거나 넘으면(=전환점이
  // 회복 기간 끝자락이거나 그 이후) 후기 구간이 존재하지 않으므로 만들지 않는다.
  if (transitionDay < recoveryTotalDays) {
    const lateStart = transitionDay + 1;
    stages.push({
      range:
        lateStart === recoveryTotalDays
          ? `D+${recoveryTotalDays}`
          : `D+${lateStart}~${recoveryTotalDays}`,
      description: '붓기가 가라앉고 피부가 자리 잡아가는 후기 회복기예요',
      current: currentDDay >= lateStart && currentDDay <= recoveryTotalDays,
    });
  }

  // currentDDay가 총 회복일을 이미 지났다면(회복 종료) 어떤 구간도 current로
  // 표시되지 않는다 — 위 두 조건 모두 자연히 false가 되므로 별도 처리 불필요.
  return stages;
}

/**
 * 주의사항 문구에 박히는 "D+N"도 recoveryTransitionDay·recoveryTotalDays로 계산해서
 * 카드의 실제 회복 기간을 절대 넘지 않게 만든다.
 */
function buildCautionList(
  recoveryTransitionDay: number,
  recoveryTotalDays: number,
): string[] {
  if (recoveryTotalDays <= 0) return [];

  const early = clampDay(recoveryTransitionDay, recoveryTotalDays);
  const full = recoveryTotalDays;

  const items = [
    `연고를 하루 2회, D+${early}까지 발라주세요`,
    `사우나·격한 운동은 D+${full}까지 자제해주세요`,
  ];

  // 전환일이 총 회복일보다 확실히 이르면(=전기/후기가 실제로 나뉘면) 음주 주의도
  // 전기 구간 기준으로 따로 안내한다. 전환일이 총 회복일과 같으면 세 문장이 전부
  // 같은 날짜를 가리켜 중복될 뿐이라 생략한다.
  if (early < full) {
    items.push(`음주는 붓기를 키울 수 있어 D+${early}까지 권하지 않아요`);
  }

  return items;
}

export default function CardDetailPage() {
  const { cardId = '1' } = useParams();
  const navigate = useNavigate();

  // TODO: city/district는 사용자 프로필 또는 위치 정보에서 가져오도록 연동 필요
  const { data: cardDetail, isLoading: isCardLoading } = useCardDetail(cardId, getLocationParams());
  const { data: cardRecords, isLoading: isRecordsLoading } = useCardRecords(cardId);

  // 로딩 상태 처리
  if (isCardLoading || isRecordsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center typo-body text-text-tertiary">
        카드 정보를 불러오는 중...
      </div>
    );
  }

  // 카드 정보가 없을 때 예외 처리
  if (!cardDetail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 typo-body text-text-tertiary">
        <p>존재하지 않거나 삭제된 카드입니다.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-accent underline"
        >
          이전으로 돌아가기
        </button>
      </div>
    );
  }

  const currentDDay = cardDetail.dday;
  // 스웨거 응답에 required가 하나도 없어서 회복일 수·오늘의 관리가 통째로 비어 올 수 있다.
  // 0으로 받으면 아래 두 계산이 알아서 빈 목록을 낸다 — 있지도 않은 구간을 지어내지 않는다.
  const totalDays = cardDetail.recoveryTotalDays ?? 0;
  const transitionDay = cardDetail.recoveryTransitionDay ?? 0;
  const records = cardRecords?.careRecords ?? [];

  // 주의사항 공통 가이드 (문구는 FE 카피, 날짜 경계는 서버 값에서 계산 — 위 블록 설명 참고)
  const cautionList = buildCautionList(transitionDay, totalDays);

  // 회복 가이드 구간 계산 (문구는 FE 카피, 날짜 경계는 서버 값에서 계산 — 위 블록 설명 참고)
  const guideStages = buildGuideStages(transitionDay, totalDays, currentDDay);

  // 증상 값 → 한글 라벨 변환
  const getSymptomLabels = (record: (typeof records)[number]) => {
    // 강도가 비어 온 증상은 태그를 달지 않는다 — 0으로 치면 "없음"이라고 답한 것처럼 보인다
    const labels: string[] = [];
    if ((record.redness ?? 0) > 0) labels.push('붉은기');
    if ((record.swelling ?? 0) > 0) labels.push('부기');
    if ((record.pain ?? 0) > 0) labels.push('통증');
    if ((record.dryness ?? 0) > 0) labels.push('건조함');
    return labels;
  };

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      {/* 0. 상단 네비게이션 바 */}
      <NavHeader title={cardDetail.treatmentName ?? NO_TREATMENT_NAME} />

      {/* 1. 시술일 & D-day 진행바 */}
      <CareInfo
        date={cardDetail.treatmentDate ?? '정보 없음'}
        dday={currentDDay}
        totalDays={totalDays}
      />

      {/* 2. 오늘의 관리 */}
      <TodayCare items={cardDetail.todayCare ?? []} />

      {/* 3. 회복 가이드 */}
      <RecoveryGuide stages={guideStages} />

      {/* 4. 주의사항 */}
      <Cautions items={cautionList} />

      {/* 5. 회복 기록 타임라인 섹션 */}
      <section className="flex flex-col gap-2.5">
        <RecordHeader count={records.length} />

        {/* 중요한 날(7, 14, 21, 29일)에만 안내 subText 출력 */}
        <RecordCTA
          onClick={() => navigate(`/records/new?cardId=${cardId}`)}
          subText={getRecordCTASubText(currentDDay)}
        />

        {/* 회복 기록 카드 목록 */}
        <div className="mt-1 flex flex-col gap-3">
          {records.map((record) => (
            <RecordCard
              key={record.recordId}
              title={[record.recordedAt, cardDetail.treatmentName]
                .filter(Boolean)
                .join(' · ')}
              dday={`D+${record.dday}`}
              photoUrls={record.photoUrls ?? undefined}
              memo={record.statusDescription ?? ''}
              tags={getSymptomLabels(record)}
              aiFeedback={record.aiFeedback?.changeSummary ?? undefined}
            />
          ))}
        </div>
      </section>

      {/* 6. 재방문 유도 — 매장 이름이 있을 때만 노출.
          매장 필드도 전부 선택이라, 이름 없는 매장 블록은 사용자에게 아무 의미가 없다 */}
      {cardDetail.visitedStore?.name && (
        <StoreGuide
          name={cardDetail.visitedStore.name}
          distanceInfo={cardDetail.visitedStore.address ?? undefined}
          mapUrl={cardDetail.visitedStore.url ?? undefined}
        />
      )}
    </div>
  );
}

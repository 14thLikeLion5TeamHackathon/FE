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
import { getLocationParams } from '../../lib/location';

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
  const totalDays = cardDetail.recoveryTotalDays;
  const records = cardRecords?.careRecords ?? [];

  // 주의사항 공통 가이드
  const cautionList = [
    '연고를 하루 2회, D+10까지 발라주세요',
    '사우나·격한 운동은 D+14까지 자제해주세요',
    '음주는 붓기를 키울 수 있어 D+7까지 권하지 않아요',
  ];

  // 회복 가이드 구간 계산
  const guideStages = [
    {
      range: 'D+1~3',
      description: '붓기와 붉은기가 가장 심한 시기',
      current: currentDDay >= 1 && currentDDay <= 3,
    },
    {
      range: 'D+4~7',
      description: '붓기가 빠지기 시작해요',
      current: currentDDay >= 4 && currentDDay <= 7,
    },
    {
      range: 'D+8~14',
      description: '피부결이 정리되는 시기',
      current: currentDDay >= 8 && currentDDay <= 14,
    },
    {
      range: 'D+15~29',
      description: '최종 결과가 자리잡는 시기',
      current: currentDDay >= 15 && currentDDay <= 29,
    },
  ];

  // 증상 값 → 한글 라벨 변환
  const getSymptomLabels = (record: (typeof records)[number]) => {
    const labels: string[] = [];
    if (record.redness > 0) labels.push('붉은기');
    if (record.swelling > 0) labels.push('부기');
    if (record.pain > 0) labels.push('통증');
    if (record.dryness > 0) labels.push('건조함');
    return labels;
  };

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      {/* 0. 상단 네비게이션 바 */}
      <NavHeader title={cardDetail.treatmentName} />

      {/* 1. 시술일 & D-day 진행바 */}
      <CareInfo
        date={cardDetail.treatmentDate}
        dday={currentDDay}
        totalDays={totalDays}
      />

      {/* 2. 오늘의 관리 */}
      <TodayCare items={cardDetail.todayCare} />

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
              title={`${record.recordedAt} · ${cardDetail.treatmentName}`}
              dday={`D+${record.dday}`}
              photoUrls={record.photoUrls}
              memo={record.statusDescription}
              tags={getSymptomLabels(record)}
              aiFeedback={record.aiFeedback?.changeSummary ?? undefined}
            />
          ))}
        </div>
      </section>

      {/* 6. 재방문 유도 — visitedStore가 있을 때만 노출 */}
      {cardDetail.visitedStore && (
        <StoreGuide
          name={cardDetail.visitedStore.name}
          distanceInfo={cardDetail.visitedStore.address}
          mapUrl={cardDetail.visitedStore.url}
        />
      )}
    </div>
  );
}

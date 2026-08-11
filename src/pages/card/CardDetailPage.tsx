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

import { useCardDetail } from '../../hooks/card/useCard';
import { useRecords } from '../../hooks/record/useRecord';

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
      return undefined; // 7, 14, 21, 29가 아니면 서브 텍스트 없음
  }
}

export default function CardDetailPage() {
  const { cardId = 'card-1' } = useParams();
  const navigate = useNavigate();

  // API 훅으로 동적 데이터 조회
  const { data: cardDetail, isLoading: isCardLoading } = useCardDetail(cardId);
  const { data: records = [], isLoading: isRecordsLoading } = useRecords(cardId);

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

  // CardDetail 타입 기반 데이터 바인딩
  const currentDDay = cardDetail.dday ?? 0;
  const totalDays = cardDetail.totalDays ?? 29;

  // todayCare 처리
  const todayCareList = Array.isArray(cardDetail.todayCare)
    ? cardDetail.todayCare
    : cardDetail.todayCare
      ? [cardDetail.todayCare]
      : [];

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

  // 재방문 유도 제휴 병원 데이터
  const storeData = {
    name: '엠레드 강남점',
    distanceInfo: '1.2km · 도보 15분',
    mapUrl: 'https://map.kakao.com/link/map/엠레드 강남점,37.498085,127.027621',
  };

  // 증상 한글 라벨 맵
  const symptomLabelMap: Record<string, string> = {
    REDNESS: '붉은기',
    SWELLING: '부기',
    PAIN: '통증',
    DRYNESS: '건조함',
  };

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      {/* 0. 상단 네비게이션 바 */}
      <NavHeader title={cardDetail.name} />

      {/* 1. 시술일 & D-day 진행바 */}
      <CareInfo
        date={cardDetail.treatedAt}
        dday={currentDDay}
        totalDays={totalDays}
      />

      {/* 2. 오늘의 관리 */}
      <TodayCare items={todayCareList} />

      {/* 3. 회복 가이드 */}
      <RecoveryGuide stages={guideStages} />

      {/* 4. 주의사항 */}
      <Cautions items={cautionList} />

      {/* 5. 회복 기록 타임라인 섹션 */}
      <section className="flex flex-col gap-2.5">
        <RecordHeader count={records.length} />

        {/* 🎯 중요한 날(7, 14, 21, 29일)에만 안내 subText 출력 */}
        <RecordCTA
          onClick={() => navigate(`/records/new?cardId=${cardId}`)}
          subText={getRecordCTASubText(currentDDay)}
        />

        {/* 회복 기록 카드 목록 */}
        <div className="mt-1 flex flex-col gap-3">
          {records.map((record) => {
            const formattedTags = record.symptoms?.map(
              (s) => symptomLabelMap[s.key] ?? s.key
            ) ?? [];

            return (
              <RecordCard
                key={record.id}
                title={`${record.recordedAt} · ${cardDetail.name}`}
                dday={`D+${record.dday}`}
                memo={record.memo}
                tags={formattedTags}
                aiFeedback="이전 기록과 비교 분석 중입니다."
              />
            );
          })}
        </div>
      </section>

      {/* 🎯 6. 재방문 유도 : D-Day 조건 없이 무조건 노출 */}
      <StoreGuide
        name={storeData.name}
        distanceInfo={storeData.distanceInfo}
        mapUrl={storeData.mapUrl}
      />
    </div>
  );
}
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

export default function CardDetailPage() {
  const { cardId = 'card-1' } = useParams();
  const navigate = useNavigate();

  // 테스트/더미 데이터 (추후 API 연동 시 백엔드 응답 D-Day로 변경)
  // 💡 아래 수치를 2, 5, 10, 25 등으로 바꿔 테스트해 보세요!
  const currentDDay = 10; 
  const totalDays = 29;

  const todayCareList = [
    '자극성 화장품을 피하고 자외선 차단을 유지해주세요',
    '붓기가 남아 있으니 취침 시 베개를 높여주세요',
  ];

  // 🎯 currentDDay 수치에 따라 active(current) 상태가 자동으로 계산됩니다.
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

  const cautionList = [
    '연고를 하루 2회, D+10까지 발라주세요',
    '사우나·격한 운동은 D+14까지 자제해주세요',
    '음주는 붓기를 키울 수 있어 D+7까지 권하지 않아요',
  ];

  // 회복 기록 리스트 (시안 기준 2건)
  const records = [
    {
      id: 'rec-1',
      title: '08.01 · 포텐자',
      dday: 'D+7',
      memo: '붉은기와 부기가 조금 남아있고, 따가움은 어제보다 줄었어요.',
      tags: ['붉은기', '부기'],
      aiFeedback:
        '이전 기록보다 붉은기 범위가 줄었어요. 지금 단계에서는 자극성 화장품을 피하고 보습을 유지해주세요.',
    },
    {
      id: 'rec-2',
      title: '08.01 · 포텐자',
      dday: 'D+7',
      memo: '붉은기와 부기가 조금 남아있고, 따가움은 어제보다 줄었어요.',
      tags: ['붉은기', '부기'],
      aiFeedback:
        '이전 기록보다 붉은기 범위가 줄었어요. 지금 단계에서는 자극성 화장품을 피하고 보습을 유지해주세요.',
    },
  ];

  // 재방문 유도 AAC 제휴 병원 데이터
  const storeData = {
    name: '엠레드 강남점',
    distanceInfo: '1.2km · 도보 15분',
    mapUrl: 'https://map.kakao.com/link/map/엠레드 강남점,37.498085,127.027621',
  };

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      {/* 0. 상단 네비게이션 바 */}
      <NavHeader title="포텐자" />

      {/* 1. 시술일 & D-day 진행바 */}
      <CareInfo
        date="2026.07.25"
        dday={currentDDay}
        totalDays={totalDays}
      />

      {/* 2. 오늘의 관리 */}
      <TodayCare items={todayCareList} />

      {/* 3. 회복 가이드 (동적 active 반응 적용 완료) */}
      <RecoveryGuide stages={guideStages} />

      {/* 4. 주의사항 */}
      <Cautions items={cautionList} />

      {/* 5. 회복 기록 타임라인 섹션 */}
      <section className="flex flex-col gap-2.5">
        {/* 헤더 */}
        <RecordHeader count={records.length} />

        {/* 오늘 상태 기록 CTA */}
        <RecordCTA
          onClick={() => navigate(`/records/new?cardId=${cardId}`)}
          subText={`D+${currentDDay}은 변화가 큰 시점이라 기록을 권해요`}
        />

        {/* 회복 기록 카드 목록 */}
        <div className="mt-1 flex flex-col gap-3">
          {records.map((record) => (
            <RecordCard
              key={record.id}
              title={record.title}
              dday={record.dday}
              memo={record.memo}
              tags={record.tags}
              aiFeedback={record.aiFeedback}
            />
          ))}
        </div>
      </section>

      {/* 6. 재방문 유도 (D+21~29일 구간에만 노출) */}
      {currentDDay >= 21 && currentDDay <= 29 && (
        <StoreGuide
          name={storeData.name}
          distanceInfo={storeData.distanceInfo}
          mapUrl={storeData.mapUrl}
        />
      )}
    </div>
  );
}
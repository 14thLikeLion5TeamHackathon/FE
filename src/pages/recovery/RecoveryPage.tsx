import { useNavigate } from 'react-router';

import PageHeader from '../../components/PageHeader';
import { useRecovery } from '../../hooks/recovery/useRecovery';
import { NO_TREATMENT_NAME, type CareCard as CareCardData } from '../../types/card';
import CareCard from './components/CareCard';
import RecoveryCurve from './components/RecoveryCurve';
import Skeleton from '../../components/Skeleton';

/** 섹션 제목. 이 화면에서만 쓰여서 여기 둔다. */
function SectionHeader({ title }: { title: string }) {
  return <h2 className="typo-section">{title}</h2>;
}

/**
 * 회복 탭.
 *
 * **카드 = 회복 여정**이라는 원칙의 화면이다.
 * 회복 곡선이 위에 오는 이유는, 기록을 받기만 하고 돌려주는 게 텍스트뿐이던 문제를
 * 이 블록이 해결하기 때문이다.
 *
 * 서버에 회복 탭용 엔드포인트가 없어서 카드 목록 + 카드별 기록을 `useRecovery`가 조립한다.
 */
export default function RecoveryPage() {
  const navigate = useNavigate();
  const {
    inProgress,
    done,
    curve,
    curveCards,
    curveCardId,
    selectCurveCard,
    isLoading,
    isError,
    isCurveLoading,
  } = useRecovery();

  const renderCards = (cards: CareCardData[]) =>
    cards.map((card) => (
      <CareCard
        key={card.cardId}
        card={card}
        onDetail={() => navigate(`/cards/${card.cardId}`)}
        onRecord={() => navigate(`/records/new?cardId=${card.cardId}`)}
      />
    ));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6" aria-busy="true">
        <PageHeader title="회복" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
        <PageHeader title="회복" />
        <p className="typo-body text-text-secondary">회복 정보를 불러오지 못했어요.</p>
      </div>
    );
  }

  const hasCards = inProgress.length + done.length > 0;
  // 완료된 카드도 고를 수 있다 — 끝난 회복의 추세야말로 다시 꺼내 보고 싶은 것이다
  const cardOptions = curveCards.map((card) => ({
    cardId: card.cardId,
    treatmentName: card.treatmentName ?? NO_TREATMENT_NAME,
  }));

  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <PageHeader title="회복" />

      {!hasCards ? (
        <section className="bg-surface-raised border-border-subtle rounded-md flex flex-col items-center gap-2 border p-6">
          <p className="typo-card-title">아직 케어 카드가 없어요</p>
          <p className="typo-caption text-text-tertiary">
            받은 시술을 등록하면 회복 흐름을 따라갈 수 있어요
          </p>
          <button
            type="button"
            onClick={() => navigate('/cards/new')}
            className="bg-primary text-primary-on typo-label rounded-btn mt-2 px-4 py-2"
          >
            카드 만들기
          </button>
        </section>
      ) : (
        <>
          {isCurveLoading && <Skeleton className="h-64" />}

          {curve && (
            <RecoveryCurve
              curve={curve}
              cardOptions={cardOptions}
              onSelectCard={selectCurveCard}
              onRecord={() => navigate(`/records/new?cardId=${curveCardId}`)}
            />
          )}

          {inProgress.length > 0 && (
            <>
              <SectionHeader title={`진행 중 ${inProgress.length}`} />
              {renderCards(inProgress)}
            </>
          )}

          {done.length > 0 && (
            <>
              <SectionHeader title={`완료 ${done.length}`} />
              {renderCards(done)}
            </>
          )}

          {/* 진행 중 섹션 헤더에 달려 있던 추가 버튼을 목록 끝으로 옮겼다.
              헤더에 두면 완료 카드만 남은 사용자에게 진입점이 사라지고, 상단에 또 두면
              같은 동작의 버튼이 두 개가 된다. 목록 끝은 카드 유무와 무관하게 한 번만 나온다. */}
          <button
            type="button"
            onClick={() => navigate('/cards/new')}
            className="border-border-subtle text-primary typo-label rounded-md border border-dashed py-3"
          >
            + 카드 추가
          </button>
        </>
      )}
    </div>
  );
}

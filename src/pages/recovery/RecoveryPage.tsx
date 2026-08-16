import { useNavigate } from 'react-router';

import PageHeader from '../../components/PageHeader';
import { useRecovery } from '../../hooks/recovery/useRecovery';
import type { CareCard as CareCardData } from '../../types/card';
import CareCard from './components/CareCard';
import RecoveryCurve from './components/RecoveryCurve';

/** 섹션 제목 + 우측 액션. 이 화면에서만 쓰여서 여기 둔다. */
function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="typo-section">{title}</h2>
      {action}
    </div>
  );
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
        <div className="bg-surface-raised rounded-md h-64 animate-pulse" />
        <div className="bg-surface-raised rounded-md h-48 animate-pulse" />
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
  // 곡선 카드 선택지는 진행 중 카드뿐이다 — 회복이 끝난 카드의 추세는 카드 상세에서 본다
  const cardOptions = inProgress.map((card) => ({
    cardId: card.cardId,
    treatmentName: card.treatmentName,
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
          {isCurveLoading && <div className="bg-surface-raised rounded-md h-64 animate-pulse" />}

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
              <SectionHeader
                title={`진행 중 ${inProgress.length}`}
                action={
                  <button
                    type="button"
                    onClick={() => navigate('/cards/new')}
                    className="typo-caption text-primary"
                  >
                    + 카드 추가
                  </button>
                }
              />
              {renderCards(inProgress)}
            </>
          )}

          {done.length > 0 && (
            <>
              <SectionHeader title={`완료 ${done.length}`} />
              {renderCards(done)}
            </>
          )}
        </>
      )}
    </div>
  );
}

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
 */
export default function RecoveryPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRecovery();

  const renderCards = (cards: CareCardData[]) =>
    cards.map((card) => (
      <CareCard
        key={card.cardId}
        card={card}
        onDetail={() => navigate(`/cards/${card.cardId}`)}
        onRecord={() => navigate('/records/new')}
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

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
        <PageHeader title="회복" />
        <p className="typo-body text-text-secondary">회복 정보를 불러오지 못했어요.</p>
      </div>
    );
  }

  const hasCards = data.inProgress.length + data.done.length > 0;

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
          {data.curve && (
            <RecoveryCurve curve={data.curve} onRecord={() => navigate('/records/new')} />
          )}

          {data.inProgress.length > 0 && (
            <>
              <SectionHeader
                title={`진행 중 ${data.inProgress.length}`}
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
              {renderCards(data.inProgress)}
            </>
          )}

          {data.done.length > 0 && (
            <>
              <SectionHeader title={`완료 ${data.done.length}`} />
              {renderCards(data.done)}
            </>
          )}
        </>
      )}
    </div>
  );
}

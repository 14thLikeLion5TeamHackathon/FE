import { useMemo, useState } from 'react';

import { NO_TREATMENT_NAME, type CareCard } from '../../types/card';
import type { RecordTimelineItem } from '../../types/record';
import type { RecoveryCurve, RecoveryPoint } from '../../types/recovery';
import { useCardRecords, useCards } from '../card/useCard';

/**
 * 곡선을 보여줄 기본 카드.
 *
 * **시술일이 가장 최근인 진행 중 카드**를 고른다. 동률이면 나중에 만든 카드(cardId가 큰 쪽).
 *
 * 왜 이 규칙인가:
 * - 회복 곡선은 "지금 내 얼굴이 어떻게 가고 있나"를 보는 도구다. 시술 직후 구간이 변화가 가장 크고
 *   사용자가 가장 자주 들여다보는 구간이라, 가장 최근 시술이 기본값일 때 헛다리를 짚을 확률이 낮다.
 * - 기록이 많은 카드를 고르는 규칙도 후보였지만, 그러면 회복이 거의 끝나 기록만 쌓인 오래된 카드가
 *   계속 자리를 선점한다. 새 시술을 받을수록 곡선이 엉뚱해지는 방향이라 버렸다.
 * - 완료 카드는 후보에서 뺀다. 회복이 끝난 카드의 추세는 카드 상세의 타임라인에서 보면 되고,
 *   회복 탭 맨 위에 둘 만큼 급한 정보가 아니다.
 *
 * 규칙이 항상 맞을 수는 없으므로, 진행 중 카드가 2장 이상이면 화면에서 사용자가 바꿀 수 있게 한다.
 */
function pickDefaultCurveCard(inProgress: CareCard[]): CareCard | null {
  if (inProgress.length === 0) return null;

  // 시술일이 비어 올 수 있다(스웨거 응답에 required가 없다). 빈 값은 가장 오래된 것으로 취급해
  // 뒤로 밀어 둔다 — 날짜를 모르는 카드가 기본 곡선을 차지하면 사용자가 헛다리를 짚는다.
  const treatedAt = (card: CareCard) => card.treatmentDate ?? '';

  return inProgress.reduce((latest, card) =>
    treatedAt(card) > treatedAt(latest) ||
    (treatedAt(card) === treatedAt(latest) && card.cardId > latest.cardId)
      ? card
      : latest,
  );
}

/** "2026-08-01" → "08.01". 곡선 라벨은 폭이 좁아 연도를 뺀다. 날짜가 없으면 D-day만 남긴다. */
function toDateLabel(recordedAt: string | null | undefined): string {
  if (!recordedAt) return '';
  const [, month, day] = recordedAt.split('-');
  return month && day ? `${month}.${day}` : recordedAt;
}

function toPoint(record: RecordTimelineItem): RecoveryPoint {
  /**
   * 강도가 비어 온 증상은 **점을 만들지 않고 뺀다.** 0으로 채우면 사용자가 "없음"이라고
   * 답한 것처럼 곡선이 바닥으로 떨어져, 실제로는 없는 회복을 보여주게 된다.
   * 빠진 자리는 SymptomChart가 알아서 메운다(찾지 못하면 0).
   */
  const symptoms: RecoveryPoint['symptoms'] = (
    [
      ['SWELLING', record.swelling],
      ['PAIN', record.pain],
      ['REDNESS', record.redness],
      ['DRYNESS', record.dryness],
    ] as const
  ).flatMap(([key, intensity]) => (typeof intensity === 'number' ? [{ key, intensity }] : []));

  return {
    recordId: record.recordId,
    ddayLabel: `D+${record.dday}`,
    dateLabel: toDateLabel(record.recordedAt),
    photoUrl: record.photoUrls?.[0] ?? null,
    symptoms,
  };
}

/**
 * 회복 탭 — 카드 목록(진행 중/완료) + 회복 곡선.
 *
 * 서버가 회복 탭 모양으로 만들어 주지 않으므로 두 호출을 여기서 조립한다.
 * 카드 목록은 화면 전체가, 타임라인은 곡선 한 장만 필요로 해서 쿼리를 나눠 둔다 —
 * 곡선 카드를 바꿔도 카드 목록은 다시 받지 않는다.
 */
export function useRecovery() {
  const cardsQuery = useCards();

  const { inProgress, done } = useMemo(() => {
    const cards = cardsQuery.data ?? [];
    return {
      inProgress: cards.filter((card) => card.status === 'IN_PROGRESS'),
      done: cards.filter((card) => card.status === 'DONE'),
    };
  }, [cardsQuery.data]);

  const [pickedCardId, setPickedCardId] = useState<number | null>(null);

  /**
   * 사용자가 고른 카드가 목록에서 사라질 수 있다(완료 처리·삭제).
   * 그때 선택을 붙들고 있으면 빈 곡선이 남으므로 기본 규칙으로 되돌린다.
   */
  const curveCard =
    inProgress.find((card) => card.cardId === pickedCardId) ?? pickDefaultCurveCard(inProgress);

  // cardId가 없으면 useCardRecords가 enabled: false로 쉰다
  const recordsQuery = useCardRecords(curveCard ? String(curveCard.cardId) : '');

  const curve: RecoveryCurve | null = useMemo(() => {
    if (!curveCard || !recordsQuery.data) return null;

    // 서버가 정렬 순서를 계약으로 보장하지 않는다. 곡선은 순서가 곧 의미라 여기서 고정한다.
    const points = [...(recordsQuery.data.careRecords ?? [])]
      .sort((a, b) => a.dday - b.dday || a.recordId - b.recordId)
      .map(toPoint);

    return {
      cardId: curveCard.cardId,
      treatmentName: curveCard.treatmentName ?? NO_TREATMENT_NAME,
      points,
    };
  }, [curveCard, recordsQuery.data]);

  return {
    inProgress,
    done,
    curve,
    /** 곡선 카드 선택 — 진행 중 카드가 2장 이상일 때만 화면에 노출한다 */
    curveCardId: curveCard?.cardId ?? null,
    selectCurveCard: setPickedCardId,
    /** 카드 목록이 화면의 뼈대다. 곡선은 그 뒤에 채워지므로 로딩 판정에 넣지 않는다. */
    isLoading: cardsQuery.isLoading,
    isError: cardsQuery.isError,
    isCurveLoading: Boolean(curveCard) && recordsQuery.isPending,
  };
}

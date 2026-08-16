import Button from '../../../components/Button';
import SectionHeader from '../../../components/SectionHeader';

type TodayEmptyStateProps = {
  /** 캘린더 연동 안내를 함께 보여줄지. 이미 연동했으면 숨긴다 */
  showCalendar: boolean;
  onConnectCalendar: () => void;
  onCreateCard: () => void;
};

/**
 * 오늘 탭 빈 상태 (시안 `오늘 — 캘린더 미연동 · 카드 없음`).
 *
 * 카드가 없으면 서버가 `cardJudgement`를 null로 준다 — 브리핑 문장이 거기 들어 있어서
 * 결론으로 쓸 게 없다. 그래서 브리핑·체크리스트·근거 대신 이 화면으로 통째로 갈아탄다.
 * 시안대로 캘린더도 이 화면에서는 감춘다 — 고를 날짜에 아무 정보가 없다.
 *
 * 공용 `EmptyStateCard`를 쓰지 않은 이유: 그 컴포넌트는 제목 + 가운데 정렬 + `rounded-card`(20px)인데,
 * 이 시안은 제목 없이 본문만 왼쪽 정렬하고 `rounded-md`(10px)에 테두리를 준다.
 */
export default function TodayEmptyState({
  showCalendar,
  onConnectCalendar,
  onCreateCard,
}: TodayEmptyStateProps) {
  return (
    <>
      {showCalendar && (
        <>
          <SectionHeader title="다가오는 일정" />
          <EmptyBlock
            description="캘린더를 연동하면 일정과 날씨에 맞춘 주의사항을 받아볼 수 있어요."
            actionLabel="캘린더 연동하기"
            onAction={onConnectCalendar}
          />
        </>
      )}

      <SectionHeader title="내 케어 카드" />
      <EmptyBlock
        description="등록된 케어 카드가 없어요. 받은 시술을 등록하면 D-day별 회복 가이드를 볼 수 있어요."
        actionLabel="케어 카드 만들기"
        onAction={onCreateCard}
      />
    </>
  );
}

function EmptyBlock({
  description,
  actionLabel,
  onAction,
}: {
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <section className="bg-surface-raised border-border-subtle rounded-md flex flex-col items-start gap-2.5 border p-4">
      <p className="typo-body text-text-secondary">{description}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </section>
  );
}

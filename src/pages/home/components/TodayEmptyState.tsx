import Button from '../../../components/Button';
import SectionHeader from '../../../components/SectionHeader';

type TodayEmptyStateProps = {
  /**
   * 캘린더 연동 여부. **`null`은 "꺼짐"이 아니라 "아직 모름"이다** — 브리핑이 오기 전 상태다.
   * 모르는 동안 감추는 이유는, 이미 연동한 사람에게 "연동하세요"라고 하지 않기 위해서다.
   */
  calendarConnected: boolean | null;
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
 * 시안이 제목 없이 본문만 왼쪽 정렬하고 `rounded-md`(10px)에 테두리를 주는 형태라
 * 다른 빈 상태와 모양이 달라서 공용으로 빼지 않았다.
 */
export default function TodayEmptyState({
  calendarConnected,
  onConnectCalendar,
  onCreateCard,
}: TodayEmptyStateProps) {
  return (
    <>
      {calendarConnected !== null && (
        <>
          <SectionHeader title="다가오는 일정" />
          {calendarConnected ? (
            /*
              연동을 막 끝내고 돌아온 사용자가 보는 자리다. 여기서 아무 말도 안 하면
              연동 버튼만 사라져서 "눌렀는데 아무 일도 안 일어났다"로 읽힌다 —
              연동은 됐고 다음 할 일이 카드 등록이라는 걸 말해준다.
            */
            <section className="bg-surface-raised border-border-subtle rounded-md border p-4">
              <p className="typo-body text-text-secondary">
                구글 캘린더가 연동돼 있어요. 케어 카드를 만들면 일정이 함께 보여요.
              </p>
            </section>
          ) : (
            <EmptyBlock
              description="캘린더를 연동하면 일정과 날씨에 맞춘 주의사항을 받아볼 수 있어요."
              actionLabel="캘린더 연동하기"
              onAction={onConnectCalendar}
            />
          )}
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

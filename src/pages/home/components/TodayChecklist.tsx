import Checkbox from '../../../components/Checkbox';
import RefreshButton from '../../../components/RefreshButton';
import { cn } from '../../../lib/cn';
import type { ChecklistItem } from '../../../types/today';

type TodayChecklistProps = {
  items: ChecklistItem[];
  onToggle: (checklistId: number, completed: boolean) => void;
  /**
   * 지난 날짜인지. 빈 목록의 뜻이 날짜에 따라 달라서 필요하다 —
   * 오늘의 빈 목록은 "할 게 없다"지만, 지난 날짜의 빈 목록은 "모른다"에 가깝다.
   */
  past?: boolean;
  /**
   * 오늘이 아닌 날짜를 보고 있을 때의 날짜("8월 19일"). 오늘이면 넘기지 않는다.
   * 어제를 보면서 "오늘의 케어"를 읽으면 어느 날 얘기인지 알 수 없다.
   *
   * `past`와 겹치지만 뜻이 다르다 — 이건 제목에 쓸 이름이고, `past`는 빈 목록을
   * 어떻게 설명할지의 판단이다. 앞날도 오늘이 아니라 이 값이 붙는다.
   */
  dateLabel?: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

/**
 * 오늘의 케어.
 * 매일 앱을 여는 이유라서 브리핑 바로 다음, 근거보다 위에 둔다.
 */
export default function TodayChecklist({
  items,
  onToggle,
  past = false,
  dateLabel,
  onRefresh,
  isRefreshing = false,
}: TodayChecklistProps) {
  const title = dateLabel ? `${dateLabel} 케어` : '오늘의 케어';
  /*
    항목이 없는 건 오류가 아니다. 회복 기간이 끝났거나(D+11인데 회복 10일) 아직 시술 전이면
    서버가 빈 배열을 준다. 그때 진행바와 "0/0"을 그대로 그리면 제목만 남은 빈 상자가 되어
    사용자는 화면이 깨진 줄 안다 — 개수 대신 이유를 말한다.

    지난 날짜는 이유를 말하지 않는다. **원인이 둘인데 우리는 구분할 수 없다** —
    서버가 그 날짜 항목을 보관하지 않았을 수도(#116), 정말 할 게 없던 날일 수도 있다.
    빈 배열만 오니 어느 쪽인지 알 방법이 없다.

    그래서 받은 것만 말한다. "할 케어가 없었어요"는 케어가 있었던 날에 거짓말이 되고,
    "남아 있지 않아요"·"생성된 게 없어요"는 반대로 보관 실패라고 단정한다 — 회복 기간이
    끝난 뒤의 날짜에는 그게 틀린다. 지난 날짜라도 서버에 남아 있으면 목록은 그대로 뜬다.
  */
  if (items.length === 0) {
    return (
      <section className="bg-surface-raised rounded-md flex flex-col gap-1.5 p-4">
        <header className="flex items-center justify-between">
          <h2 className="typo-section">{title}</h2>
          <RefreshButton onClick={onRefresh} isRefreshing={isRefreshing} />
        </header>
        <p className="typo-body text-text-secondary">
          {/*
            셋을 구분한다. 지난 날짜는 "기록된" 것만 말한다 — 원인을 모르는 채로 참인
            문장이다. 앞날·오늘은 실제로 할 게 없는 상태라 이유까지 말할 수 있고,
            그 둘은 가리키는 날만 다르다.
          */}
          {past
            ? '이 날짜에 기록된 케어가 없어요.'
            : `${dateLabel ? '이 날짜에' : '오늘'} 할 케어가 없어요. 회복 기간이 끝났거나 아직 시작 전이에요.`}
        </p>
      </section>
    );
  }

  // completed·label·sourceLabel은 계약상 빠질 수 있다(types/today.ts). 없으면 "안 함"·빈 문자열로 본다 —
  // 항목을 통째로 버리면 사용자가 자기 할 일을 잃어버린 것처럼 보이기 때문이다.
  const doneCount = items.filter((item) => item.completed === true).length;
  const ratio = (doneCount / items.length) * 100;

  return (
    <section className="bg-surface-raised rounded-md flex flex-col gap-3 p-4">
      <header className="flex items-center justify-between">
        <h2 className="typo-section">{title}</h2>
        <span className="typo-caption text-text-secondary">
          {doneCount}/{items.length}
        </span>
      </header>

      {/* 진행률 — 트랙과 채움만 있는 단순한 막대라 별도 컴포넌트로 빼지 않았다 */}
      <div className="bg-border-subtle rounded-bar h-1.5 w-full" aria-hidden>
        <div className="bg-primary rounded-bar h-full" style={{ width: `${ratio}%` }} />
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.checklistId} className="flex items-center gap-3">
            <Checkbox
              checked={item.completed ?? false}
              onChange={(event) => onToggle(item.checklistId, event.target.checked)}
              aria-label={item.label ?? '체크리스트 항목'}
            />
            <span
              className={cn(
                'typo-body flex-1',
                item.completed ? 'text-text-tertiary' : 'text-text-primary',
              )}
            >
              {item.label ?? ''}
            </span>
            <span className="typo-caption text-text-tertiary">{item.sourceLabel ?? ''}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

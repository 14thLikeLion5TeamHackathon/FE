import Checkbox from '../../../components/Checkbox';
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
};

/**
 * 오늘의 케어.
 * 매일 앱을 여는 이유라서 브리핑 바로 다음, 근거보다 위에 둔다.
 */
export default function TodayChecklist({ items, onToggle, past = false }: TodayChecklistProps) {
  /*
    항목이 없는 건 오류가 아니다. 회복 기간이 끝났거나(D+11인데 회복 10일) 아직 시술 전이면
    서버가 빈 배열을 준다. 그때 진행바와 "0/0"을 그대로 그리면 제목만 남은 빈 상자가 되어
    사용자는 화면이 깨진 줄 안다 — 개수 대신 이유를 말한다.

    지난 날짜는 이유를 다르게 말한다. 서버가 그 날짜 항목을 보관하지 않아 빈 목록이 오는데,
    "할 케어가 없었어요"라고 쓰면 실제로 케어가 있었던 날에 거짓말이 된다. 모르는 건 모른다고 둔다.
  */
  if (items.length === 0) {
    return (
      <section className="bg-surface-raised rounded-md flex flex-col gap-1.5 p-4">
        <h2 className="typo-section">오늘의 케어</h2>
        <p className="typo-body text-text-secondary">
          {past
            ? '지난 날짜의 케어 목록은 아직 불러올 수 없어요.'
            : '오늘 할 케어가 없어요. 회복 기간이 끝났거나 아직 시작 전이에요.'}
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
        <h2 className="typo-section">오늘의 케어</h2>
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

import Checkbox from '../../../components/Checkbox';
import { cn } from '../../../lib/cn';
import type { ChecklistItem } from '../../../types/today';

type TodayChecklistProps = {
  items: ChecklistItem[];
  onToggle: (checklistId: number, completed: boolean) => void;
};

/**
 * 오늘의 케어.
 * 매일 앱을 여는 이유라서 브리핑 바로 다음, 근거보다 위에 둔다.
 */
export default function TodayChecklist({ items, onToggle }: TodayChecklistProps) {
  // completed·label·sourceLabel은 계약상 빠질 수 있다(types/today.ts). 없으면 "안 함"·빈 문자열로 본다 —
  // 항목을 통째로 버리면 사용자가 자기 할 일을 잃어버린 것처럼 보이기 때문이다.
  const doneCount = items.filter((item) => item.completed === true).length;
  const ratio = items.length === 0 ? 0 : (doneCount / items.length) * 100;

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

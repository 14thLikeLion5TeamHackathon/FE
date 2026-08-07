import Checkbox from '../../../components/Checkbox';
import { cn } from '../../../lib/cn';
import type { ChecklistItem } from '../../../types/today';

type TodayChecklistProps = {
  items: ChecklistItem[];
  onToggle: (itemId: string, done: boolean) => void;
};

/**
 * 오늘의 케어.
 * 매일 앱을 여는 이유라서 브리핑 바로 다음, 근거보다 위에 둔다.
 */
export default function TodayChecklist({ items, onToggle }: TodayChecklistProps) {
  const doneCount = items.filter((item) => item.done).length;
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
          <li key={item.id} className="flex items-center gap-3">
            <Checkbox
              checked={item.done}
              onChange={(event) => onToggle(item.id, event.target.checked)}
              aria-label={item.label}
            />
            <span
              className={cn(
                'typo-body flex-1',
                item.done ? 'text-text-tertiary' : 'text-text-primary',
              )}
            >
              {item.label}
            </span>
            <span className="typo-caption text-text-tertiary">{item.source}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

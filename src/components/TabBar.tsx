import { NavLink } from 'react-router';

import { cn } from '../lib/cn';

const TABS = [
  { to: '/', label: '오늘' },
  { to: '/recovery', label: '회복' },
] as const;

function TabItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} end className="flex flex-1 flex-col items-center gap-1">
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'size-[18px] rounded-full',
              isActive ? 'bg-primary' : 'bg-surface-fill-strong',
            )}
          />
          <span className={cn('typo-caption', isActive ? 'text-primary' : 'text-text-tertiary')}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

/**
 * 하단 탭바. 오늘 · 회복 · [기록] · 마이 4슬롯이고 3번은 탭이 아니라 액션 버튼이다.
 * "장소가 아니라 행위"라 탭과 구분해 떠 있는 원형 버튼으로 둔다(명세: 하단 네비게이션 > 액션 버튼).
 *
 * index.html에 viewport-fit=cover가 있어 세이프 에어리어를 직접 처리해야 한다.
 * 안 하면 아이폰 홈 인디케이터가 탭 라벨을 덮는다.
 * 높이 상수는 TabLayout의 하단 패딩과 맞물리므로 TAB_BAR_HEIGHT를 같이 쓴다.
 */
export const TAB_BAR_HEIGHT = 61;

type TabBarProps = {
  /** 기록 버튼 — 곧장 이동하지 않고 카드 선택 시트를 먼저 연다 */
  onRecord: () => void;
};

export default function TabBar({ onRecord }: TabBarProps) {
  return (
    <nav
      className="bg-surface-sunken fixed bottom-0 left-1/2 flex w-full max-w-app -translate-x-1/2 items-center pb-[env(safe-area-inset-bottom)]"
      style={{ height: `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom))` }}
    >
      {TABS.map((tab) => (
        <TabItem key={tab.to} {...tab} />
      ))}

      {/* 기록 슬롯 — 라벨은 다른 탭과 같은 자리에 두고 버튼만 위로 띄운다 */}
      <div className="relative flex flex-1 flex-col items-center gap-1">
        <button
          type="button"
          onClick={onRecord}
          aria-label="상태 기록"
          aria-haspopup="dialog"
          className="bg-primary text-primary-on shadow-fab absolute -top-[9px] flex size-11 items-center justify-center rounded-full"
        >
          <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden>
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {/* 버튼이 absolute라 자리를 안 차지한다 — 라벨 높이를 맞추기 위한 투명 스페이서 */}
        <span className="size-[18px]" aria-hidden />
        <span className="typo-caption text-text-tertiary">기록</span>
      </div>

      <TabItem to="/my" label="마이" />
    </nav>
  );
}

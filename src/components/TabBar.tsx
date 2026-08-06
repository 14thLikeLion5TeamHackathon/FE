import { NavLink, useNavigate } from 'react-router';

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
 */
export default function TabBar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-surface-sunken fixed bottom-0 left-1/2 flex h-[61px] w-full max-w-[430px] -translate-x-1/2 items-center">
      {TABS.map((tab) => (
        <TabItem key={tab.to} {...tab} />
      ))}

      {/* 기록 슬롯 — 라벨은 다른 탭과 같은 자리에 두고 버튼만 위로 띄운다 */}
      <div className="relative flex flex-1 flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => navigate('/records/new')}
          aria-label="상태 기록"
          className="bg-primary text-primary-on absolute -top-[9px] flex size-11 items-center justify-center rounded-full shadow-lg"
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

import { NavLink } from 'react-router';

import { cn } from '../lib/cn';

/**
 * 탭 아이콘.
 *
 * 선(stroke) 기반에 `currentColor`를 쓴다 — 활성/비활성 색을 라벨과 같은 클래스 하나로
 * 맞추기 위해서다. 채움(fill) 아이콘으로 두면 활성 상태에서 라벨보다 훨씬 무거워 보인다.
 * viewBox는 20으로 통일해 세 아이콘의 시각적 굵기가 어긋나지 않게 한다.
 */
type IconProps = { className?: string };

/** 오늘 — 캘린더. 날짜를 고르는 화면이라는 뜻 */
function TodayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden>
      <rect
        x="2.75"
        y="4.25"
        width="14.5"
        height="13"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2.75 8.25h14.5M6.75 2.75v3M13.25 2.75v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 회복 — 우상향 곡선. 이 탭의 주인공인 회복 곡선을 그대로 줄인 모양 */
function RecoveryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden>
      <path
        d="M2.75 14.5c3.5 0 4.5-9 7-9s3.5 5 7.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2.75 17.25h14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 마이 — 사람 */
function MyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden>
      <circle cx="10" cy="6.75" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.75 16.75c0-3 2.8-4.75 6.25-4.75s6.25 1.75 6.25 4.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TABS = [
  { to: '/', label: '오늘', Icon: TodayIcon },
  { to: '/recovery', label: '회복', Icon: RecoveryIcon },
] as const;

function TabItem({ to, label, Icon }: { to: string; label: string; Icon: React.FC<IconProps> }) {
  return (
    <NavLink to={to} end className="flex flex-1 flex-col items-center gap-1">
      {({ isActive }) => (
        // 색을 부모에서 한 번만 정한다 — 아이콘은 currentColor라 라벨과 늘 같은 색이 된다
        <div
          className={cn(
            'flex flex-col items-center gap-1',
            isActive ? 'text-primary' : 'text-text-tertiary',
          )}
        >
          <Icon className="size-[18px]" />
          <span className="typo-caption">{label}</span>
        </div>
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
          {/*
            탭 아이콘(1.5)보다 굵다. 이건 탭이 아니라 주요 액션이라 같은 굵기로 두면
            떠 있는 원형 버튼인데도 옆 탭들과 같은 무게로 읽힌다.
          */}
          <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden>
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {/* 버튼이 absolute라 자리를 안 차지한다 — 라벨 높이를 맞추기 위한 투명 스페이서 */}
        <span className="size-[18px]" aria-hidden />
        <span className="typo-caption text-text-tertiary">기록</span>
      </div>

      <TabItem to="/my" label="마이" Icon={MyIcon} />
    </nav>
  );
}

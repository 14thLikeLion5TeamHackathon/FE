import { Outlet } from 'react-router';

import TabBar, { TAB_BAR_HEIGHT } from '../../components/TabBar';

/**
 * 탭 화면(오늘 · 회복 · 마이) 공통 레이아웃.
 * TabBar는 fixed라 문서 흐름에서 빠지므로, 콘텐츠 하단에 바 높이 + 세이프 에어리어만큼 패딩을 준다.
 */
export default function TabLayout() {
  return (
    <div
      className="bg-surface-canvas mx-auto min-h-dvh w-full max-w-[430px]"
      style={{ paddingBottom: `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom))` }}
    >
      <Outlet />
      <TabBar />
    </div>
  );
}

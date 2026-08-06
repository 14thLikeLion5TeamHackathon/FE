import { Outlet } from 'react-router';

/**
 * 서브페이지(탭이 아닌 화면) 공통 레이아웃.
 *
 * TabLayout과 달리 하단 바를 여기서 그리지 않는다.
 * 하단 CTA가 필요한 화면만 각자 `<BottomCTA />`를 두고,
 * 그 화면의 콘텐츠가 BOTTOM_CTA_HEIGHT 만큼 아래 여백을 준다.
 */
export default function SubLayout() {
  return (
    <div className="bg-surface-canvas max-w-app mx-auto min-h-dvh w-full">
      <Outlet />
    </div>
  );
}

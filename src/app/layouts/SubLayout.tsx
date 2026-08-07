import { Outlet } from 'react-router';

/**
 * 서브페이지(탭이 아닌 화면) 공통 레이아웃.
 *
 * TabLayout과 달리 하단 바를 여기서 그리지 않는다.
 * 하단 CTA가 필요한 화면만 각자 `<BottomCTA />`를 두고, 그 화면이 콘텐츠 하단에 `pb-28`(112px)을 준다.
 * 어떤 화면은 CTA가 없으므로(카드 상세·AI 피드백) 레이아웃이 일괄로 여백을 주면 안 된다.
 */
export default function SubLayout() {
  return (
    <div className="bg-surface-canvas max-w-app mx-auto min-h-dvh w-full">
      <Outlet />
    </div>
  );
}

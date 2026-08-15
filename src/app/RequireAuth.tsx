import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '../hooks/auth/useAuth';

/**
 * 라우트 가드 — 토큰이 없으면 로그인으로 보낸다.
 * 레이아웃처럼 라우트를 감싸고, 통과하면 Outlet으로 자식 화면을 그린다.
 */
export default function RequireAuth() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // 로그인 후 원래 가려던 곳으로 돌려보내기 위해 현재 위치를 넘긴다.
    // replace가 없으면 뒤로가기에서 로그인↔홈이 무한히 반복된다.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

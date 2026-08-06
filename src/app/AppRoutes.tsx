import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

// 라우트별 코드 스플리팅: 방문하는 화면 청크만 로드된다.
const HomePage = lazy(() => import('../pages/home/HomePage'));
const RecoveryPage = lazy(() => import('../pages/recovery/RecoveryPage'));
const MyPage = lazy(() => import('../pages/my/MyPage'));

// 레이아웃은 모든 탭 화면에서 쓰이므로 lazy로 쪼개지 않는다.
import TabLayout from './layouts/TabLayout';

/** lazy 라우트 청크 로딩 중 표시 (레이아웃 흔들림 최소화) */
function RouteFallback() {
  return (
    <div className="bg-surface-canvas min-h-dvh" aria-busy="true" aria-label="불러오는 중" />
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* 탭 화면 — 하단 TabBar 공유 */}
        <Route element={<TabLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="/my" element={<MyPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router';

// 라우트별 코드 스플리팅: 방문하는 화면 청크만 로드된다.
const HomePage = lazy(() => import('../pages/home/HomePage'));

/** 공통 레이아웃 (헤더·하단바 등이 생기면 여기에) */
function RootLayout() {
  return <Outlet />;
}

/** lazy 라우트 청크 로딩 중 표시 (레이아웃 흔들림 최소화) */
function RouteFallback() {
  return (
    <div className="bg-surface-canvas min-h-screen" aria-busy="true" aria-label="불러오는 중" />
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

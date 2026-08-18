import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import RequireAuth from './RequireAuth';
import SubLayout from './layouts/SubLayout';
// 레이아웃은 거의 모든 화면에서 쓰이므로 lazy로 쪼개지 않는다.
import TabLayout from './layouts/TabLayout';

// 라우트별 코드 스플리팅: 방문하는 화면 청크만 로드된다.
const HomePage = lazy(() => import('../pages/home/HomePage'));
const RecoveryPage = lazy(() => import('../pages/recovery/RecoveryPage'));
const MyPage = lazy(() => import('../pages/my/MyPage'));
const ProfileEditPage = lazy(() => import('../pages/my/ProfileEditPage'));
const ConnectCallbackPage = lazy(() => import('../pages/oauth/ConnectCallbackPage'));

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const CardCreatePage = lazy(() => import('../pages/card/CardCreatePage'));
const CardDetailPage = lazy(() => import('../pages/card/CardDetailPage'));
const RecordCreatePage = lazy(() => import('../pages/record/RecordCreatePage'));
const FeedbackPage = lazy(() => import('../pages/record/FeedbackPage'));
const ScheduleFormPage = lazy(() => import('../pages/schedule/ScheduleFormPage'));

/** lazy 라우트 청크 로딩 중 표시 (레이아웃 흔들림 최소화) */
function RouteFallback() {
  return <div className="bg-surface-canvas min-h-dvh" aria-busy="true" aria-label="불러오는 중" />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* 진입 화면 — 탭바도 뒤로가기도 없다 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 여기부터는 토큰이 있어야 들어온다 */}
        <Route element={<RequireAuth />}>
          {/* 회원가입 = 온보딩(POST /api/v1/auth/onboarding). 소셜 로그인으로 토큰을 받은 뒤
              isNewUser로 분기해 들어오는 화면이라 가드 안이다 — 밖에 두면 제출에서 401을 맞는다. */}
          <Route element={<SubLayout />}>
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* 탭 화면 — 하단 TabBar 공유 */}
          <Route element={<TabLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/recovery" element={<RecoveryPage />} />
            <Route path="/my" element={<MyPage />} />
          </Route>

          {/* 서브페이지 — 뒤로가기 헤더 */}
          <Route element={<SubLayout />}>
            <Route path="/my/edit" element={<ProfileEditPage />} />
            {/* 구글·카카오 동의 화면에서 돌아오는 자리.
                경로가 다른 건 제공자 콘솔에 이미 등록된 값에 맞춘 것이다 —
                바꾸려면 콘솔 등록도 같이 고쳐야 한다(lib/connect.ts의 CONNECT_PATH). */}
            <Route path="/oauth/google" element={<ConnectCallbackPage provider="google" />} />
            <Route
              path="/oauth/kakao/notification/callback"
              element={<ConnectCallbackPage provider="kakao" />}
            />
            <Route path="/cards/new" element={<CardCreatePage />} />
            <Route path="/cards/:cardId" element={<CardDetailPage />} />
            <Route path="/records/new" element={<RecordCreatePage />} />
            <Route path="/records/:recordId/feedback" element={<FeedbackPage />} />
            <Route path="/schedules/new" element={<ScheduleFormPage />} />
            <Route path="/schedules/:scheduleId/edit" element={<ScheduleFormPage />} />
          </Route>
        </Route>

        {/* 없는 경로는 홈으로. 비로그인이면 가드가 이어서 /login으로 보낸다 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

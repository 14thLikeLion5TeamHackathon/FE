import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import { consumeOAuthRedirect } from './api/oauth';
import App from './App.tsx';

/**
 * 서버 리다이렉트 로그인의 귀환 처리 — 렌더보다 **먼저** 한다.
 *
 * 성공 시 어느 경로로 돌려보내는지 확정되지 않아 라우트에 매달 수 없고, 홈(`/`)으로 떨어지면
 * 라우트 가드가 렌더 중에 /login으로 튕겨내면서 토큰이 실린 쿼리스트링이 통째로 사라진다.
 * 그래서 React가 뜨기 전에 저장을 끝낸다.
 *
 * 저장 뒤에는 주소창에서 토큰을 지운다 — 히스토리·공유 링크에 남으면 안 된다.
 */
function handleOAuthRedirect() {
  const result = consumeOAuthRedirect();
  if (!result) return;

  // 실패는 그대로 둔다. /login?error=... 를 로그인 화면이 읽어 안내 문구를 띄운다.
  if (result.status === 'failed') return;

  window.history.replaceState(null, '', result.status === 'new-user' ? '/signup' : '/');
}

handleOAuthRedirect();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본값 retry: 3은 401 한 번을 리다이렉트 4번으로 부풀린다.
      // 첫 401에 토큰이 지워져 이후 재시도는 헤더 없이 나가 확정 401이 되기 때문.
      // 4xx는 재시도해도 결과가 같으므로 서버 오류·네트워크 실패에만 재시도한다.
      retry: (failureCount, error) => {
        const status = (error as { status?: number } | null)?.status;
        if (typeof status === 'number' && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

/** dev 전용 MSW 목 시작 (BE 미배포 엔드포인트 선개발). prod 빌드엔 포함 안 됨. */
async function enableMocking() {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('./mocks/browser');
  // 목에 없는 요청(에셋·실 API)은 그대로 통과.
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
});

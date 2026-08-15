import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import App from './App.tsx';

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

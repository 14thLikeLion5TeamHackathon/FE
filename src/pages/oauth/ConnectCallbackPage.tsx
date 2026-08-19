import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { connectCalendar, connectKakaoNotification } from '../../api/connect';
import Button from '../../components/Button';
import NavHeader from '../../components/NavHeader';
import { cn } from '../../lib/cn';
import { readAuthCode, redirectUri, type ConnectProvider } from '../../lib/connect';

const LABEL: Record<ConnectProvider, string> = {
  google: '구글 캘린더',
  kakao: '카카오톡 알림',
};

/**
 * 연동 콜백 — 구글·카카오 동의 화면에서 돌아오는 자리.
 *
 * 두 연동의 흐름이 같아 화면 하나로 받는다. 경로만 다른데, 그건 콘솔에 등록된 값에
 * 맞춘 것이라 라우트에서 provider를 넘겨 구분한다(lib/connect.ts의 CONNECT_PATH 참고).
 *
 * 사용자가 동의를 거부하면 코드 대신 `error=access_denied`가 온다. 그건 실패가 아니라
 * 선택이라 "실패했어요"라고 말하지 않는다 — 그렇게 말하면 앱이 고장난 줄 안다.
 */
export default function ConnectCallbackPage({ provider }: { provider: ConnectProvider }) {
  const navigate = useNavigate();
  const label = LABEL[provider];

  /**
   * 인가 코드는 **첫 렌더에 한 번만 읽는다.**
   *
   * 렌더 본문에서 `readAuthCode(...)`를 부르면 매 렌더 새 객체가 나오고, 그게 아래 effect의
   * 의존성이라 effect가 계속 다시 돈다. 게다가 성공 직후 `replaceState`로 주소창의 코드를
   * 지우기 때문에, 다시 읽으면 코드가 사라진 상태가 보인다 — 값이 렌더마다 달라지는 셈이다.
   * 화면이 "연결하는 중"에서 못 벗어나던 원인이다(요청은 200으로 성공해 있었다).
   *
   * 주소창은 지워도 이 값은 남아야 한다. 판단의 근거는 "처음 도착했을 때 뭐가 왔는가"다.
   */
  const [result] = useState(() => readAuthCode(window.location.search));
  const denied = 'error' in result && result.error === 'access_denied';

  const connect = useMutation({
    mutationFn: (code: string) =>
      provider === 'google'
        ? connectCalendar(code, redirectUri('google'))
        : connectKakaoNotification(code, redirectUri('kakao')),
    onSuccess: () => {
      // 주소창에 인가 코드를 남기지 않는다 — 뒤로 가기로 재사용되면 확정 실패다
      window.history.replaceState(null, '', window.location.pathname);
    },
  });

  /**
   * 인가 코드는 **일회용**이다. React 18 StrictMode는 dev에서 effect를 두 번 실행하는데,
   * 두 번째 요청은 반드시 실패한다 — 연동은 됐는데 화면만 실패로 보이게 된다.
   */
  const sent = useRef(false);
  const { mutate } = connect;

  useEffect(() => {
    if (sent.current || !('code' in result)) return;
    sent.current = true;
    mutate(result.code);
  }, [mutate, result]);

  /*
    `result`가 이제 안정된 값이라 이 effect는 마운트 뒤 한 번만 돈다.
    StrictMode가 effect를 두 번 실행해도 sent 가드가 두 번째를 막는다 —
    인가 코드는 일회용이라 두 번째 요청은 반드시 실패한다.
  */

  /**
   * 상태 넷을 하나로 모은다 — 문구·아이콘·버튼이 따로 갈리면 "성공인데 재시도 버튼"처럼
   * 서로 어긋난 조합이 생긴다. 한 곳에서 정하고 아래는 그리기만 한다.
   */
  const view = denied
    ? {
        tone: 'neutral' as const,
        title: '연동을 취소하셨어요',
        body: `마이에서 언제든 ${label}을 다시 연결할 수 있어요.`,
      }
    : connect.isSuccess
      ? {
          tone: 'success' as const,
          title: `${label} 연동 완료`,
          body: '이제 오늘 탭 안내에 반영돼요.',
        }
      : connect.isError || !('code' in result)
        ? {
            tone: 'error' as const,
            title: '연동에 실패했어요',
            body: '잠시 후 마이에서 다시 시도해주세요.',
          }
        : {
            tone: 'pending' as const,
            title: `${label}을 연결하는 중이에요`,
            body: '잠시만 기다려주세요.',
          };

  const settled = view.tone !== 'pending';

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-5 pb-8">
      <NavHeader title="연동" />

      {/* 결과 하나만 있는 화면이라 가운데에 세운다 — 위에 붙이면 빈 화면처럼 보인다 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <StatusMark tone={view.tone} />
        <div className="flex flex-col gap-1.5">
          <h2 className="typo-section" aria-live="polite">
            {view.title}
          </h2>
          <p className="typo-body text-text-secondary">{view.body}</p>
        </div>
      </div>

      {/* 아직 진행 중일 때 버튼을 두면 연동을 끊고 나가게 된다 */}
      {settled && (
        <Button className="w-full py-4" onClick={() => navigate('/my', { replace: true })}>
          마이로 돌아가기
        </Button>
      )}
    </div>
  );
}

/** 결과를 한눈에 알리는 원형 표시. 색과 기호 둘 다로 구분한다 — 색만으로는 구분 못 하는 사용자가 있다 */
function StatusMark({ tone }: { tone: 'success' | 'error' | 'neutral' | 'pending' }) {
  if (tone === 'pending') {
    return (
      <div
        className="border-border-subtle border-t-primary size-12 animate-spin rounded-full border-2"
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        'flex size-12 items-center justify-center rounded-full',
        tone === 'success' && 'bg-primary text-primary-on',
        tone === 'error' && 'bg-danger text-primary-on',
        tone === 'neutral' && 'bg-surface-elevated text-text-secondary',
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {tone === 'success' && <path d="M5 12.5L10 17.5L19 7" />}
        {tone === 'error' && <path d="M7 7L17 17M17 7L7 17" />}
        {tone === 'neutral' && <path d="M6 12H18" />}
      </svg>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { connectCalendar, connectKakaoNotification } from '../../api/connect';
import NavHeader from '../../components/NavHeader';
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

  const result = readAuthCode(window.location.search);
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

  const message = denied
    ? `${label} 연동을 취소하셨어요. 마이에서 언제든 다시 연결할 수 있어요.`
    : connect.isSuccess
      ? `${label} 연동이 완료됐어요.`
      : connect.isError || !('code' in result)
        ? `${label} 연동에 실패했어요. 잠시 후 다시 시도해주세요.`
        : `${label}을 연결하는 중이에요...`;

  const settled = denied || connect.isSuccess || connect.isError || !('code' in result);

  return (
    <div className="flex min-h-dvh flex-col gap-3.5 px-5 pt-5">
      <NavHeader title="연동" />
      <p className="typo-body text-text-secondary" aria-live="polite">
        {message}
      </p>

      {settled && (
        <button
          type="button"
          onClick={() => navigate('/my', { replace: true })}
          className="bg-primary text-primary-on typo-label rounded-btn self-start px-6 py-3"
        >
          마이로 돌아가기
        </button>
      )}
    </div>
  );
}

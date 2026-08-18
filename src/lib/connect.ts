/**
 * 외부 서비스 연동 시작 — 인가 코드(authorization code) 흐름.
 *
 * 소셜 **로그인**과 헷갈리기 쉬운데 주체가 다르다. 로그인은 BE가 자기 client_id로
 * 처리해서 프론트는 `/oauth2/authorization/{provider}`로 보내기만 하면 된다(api/oauth.ts).
 * 반면 **연동**은 프론트가 직접 동의 화면을 열어 인가 코드를 받아 BE에 넘긴다.
 * 그래서 여기서만 FE용 키가 필요하다.
 *
 * 흐름:
 *   1. 제공자 동의 화면으로 최상위 이동 (아래 start*)
 *   2. 동의하면 우리 redirect_uri로 `?code=...`를 달고 돌아온다
 *   3. 콜백 화면이 그 코드를 BE에 넘긴다 (api/connect.ts)
 *
 * ⚠️ **redirect_uri는 1번과 3번이 글자 하나까지 같아야 한다.** BE가 구글·카카오에
 * 토큰을 교환하러 갈 때 이 값을 그대로 다시 보내는데, 하나라도 다르면 제공자가
 * `redirect_uri_mismatch`로 거절한다. 그래서 양쪽이 같은 상수를 쓰게 만들어 둔다.
 */

export type ConnectProvider = 'google' | 'kakao';

/** 키는 .env로만 넣는다 — 이 파일은 퍼블릭 레포에 커밋된다 */
const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const KAKAO_REST_KEY: string = import.meta.env.VITE_KAKAO_REST_KEY || '';

/**
 * 콜백 경로. **콘솔에 이미 등록된 값에 맞춘 것이라 마음대로 바꾸면 안 된다.**
 *
 * 카카오 쪽이 `/oauth/kakao`가 아닌 이유는, BE가 알림 연동용으로 이 경로를
 * 카카오 콘솔에 먼저 등록해뒀기 때문이다. 등록 개수에 상한이 있어 새로 추가하는 것보다
 * 있는 값을 쓰는 편이 낫다. 여기를 고치려면 콘솔 등록도 같이 고쳐야 한다.
 */
export const CONNECT_PATH: Record<ConnectProvider, string> = {
  google: '/oauth/google',
  kakao: '/oauth/kakao/notification/callback',
};

/**
 * 콜백 주소. 제공자 콘솔에 등록된 값과 정확히 일치해야 한다.
 *
 * `window.location.origin`으로 만들어 로컬과 배포가 각각 자기 주소를 쓴다 —
 * 대신 **두 오리진 모두 콘솔에 등록돼 있어야** 한다. 등록 안 된 오리진에서 누르면
 * 동의 화면이 아니라 제공자의 에러 페이지가 뜬다.
 */
export function redirectUri(provider: ConnectProvider): string {
  return `${window.location.origin}${CONNECT_PATH[provider]}`;
}

/** 이 제공자로 연동을 시작할 수 있는지. 키가 없으면 버튼을 잠근다 */
export function isConnectConfigured(provider: ConnectProvider): boolean {
  return provider === 'google' ? Boolean(GOOGLE_CLIENT_ID) : Boolean(KAKAO_REST_KEY);
}

/**
 * 구글 캘린더 동의 화면으로 이동.
 *
 * 스코프는 읽기 전용이다 — 일정을 가져와 브리핑에 쓸 뿐 만들거나 지우지 않는다(BE 확인).
 * `access_type=offline`과 `prompt=consent`를 붙여야 refresh token이 온다.
 * BE가 나중에 사용자 없이 일정을 다시 읽으려면 그게 필요하다.
 */
export function startGoogleCalendarConnect(): void {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri('google'),
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    access_type: 'offline',
    prompt: 'consent',
  });
  window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

/**
 * 카카오 알림 동의 화면으로 이동.
 *
 * `client_id`는 **REST API 키**다. JavaScript 키가 아니다 —
 * 그건 JS SDK(`Kakao.init`)용이라 이 리다이렉트 방식에는 안 맞는다.
 *
 * `talk_message`는 나에게 메시지 보내기 권한이다. 카카오 콘솔의 동의항목에서
 * 이 스코프가 켜져 있어야 하고, 꺼져 있으면 동의 화면에서 막힌다.
 */
export function startKakaoNotificationConnect(): void {
  const params = new URLSearchParams({
    client_id: KAKAO_REST_KEY,
    redirect_uri: redirectUri('kakao'),
    response_type: 'code',
    scope: 'talk_message',
  });
  window.location.assign(`https://kauth.kakao.com/oauth/authorize?${params}`);
}

/**
 * 콜백 URL에서 인가 코드를 꺼낸다.
 *
 * 사용자가 동의를 거부하면 코드 대신 `?error=access_denied`가 온다 —
 * 그건 실패가 아니라 사용자의 선택이라 화면에서 다르게 말해야 한다.
 */
export function readAuthCode(search: string): { code: string } | { error: string } {
  const params = new URLSearchParams(search);
  const code = params.get('code');
  if (code) return { code };
  return { error: params.get('error') ?? 'unknown' };
}

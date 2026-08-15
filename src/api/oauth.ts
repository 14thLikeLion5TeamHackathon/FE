import { setAccessToken, setRefreshToken } from './token';

/**
 * 소셜 로그인 — 서버 리다이렉트 방식.
 *
 * BE가 Spring Security OAuth2를 쓰고 있어서 로그인은 우리가 부르는 API가 아니라 **페이지 이동**이다.
 * `/oauth2/authorization/{provider}`로 최상위 이동하면 BE가 동의 화면으로 302를 보내고,
 * 끝나면 토큰을 실어 우리 쪽으로 되돌려준다. 이 경로는 컨트롤러가 아니라 필터라서 Swagger에 없다.
 *
 * axios로 부르면 안 된다 — 302를 따라가다 CORS에 막히고, BE가 심는 state/PKCE 쿠키도 붙지 않는다.
 * client_id도 state도 BE가 만든다. 프론트가 가진 건 이 파일이 전부다.
 */

export type SocialProvider = 'kakao' | 'google';

/**
 * BE 오리진.
 *
 * 프록시를 통하면 안 된다 — 콜백(`redirect_uri`)이 BE 절대 주소로 박혀 있어서,
 * 인가를 우리 오리진에서 시작하면 BE가 심은 state 쿠키를 콜백 시점에 못 찾는다.
 * 서버 주소를 코드에 적지 않는 이유는 이 파일이 공개 레포에 올라가기 때문이다.
 */
const OAUTH_ORIGIN: string =
  import.meta.env.VITE_OAUTH_ORIGIN || import.meta.env.VITE_API_PROXY_TARGET || '';

/**
 * 이 제공자로 로그인할 수 있는지.
 *
 * 구글은 콜백 주소가 IP면 인가 자체를 거부한다("공개 최상위 도메인으로 끝나야 합니다").
 * 리다이렉트 방식의 콜백은 BE 주소라, BE가 IP로 떠 있는 동안 구글 로그인은 불가능하다.
 * 카카오는 IP를 받아주므로 영향이 없다.
 *
 * 도메인이 붙어 .env의 주소만 바꾸면 구글이 저절로 살아난다 — 코드를 고칠 필요가 없다.
 * (localhost는 구글이 예외로 허용해서 로컬 BE로는 테스트된다)
 */
export function isConfigured(provider: SocialProvider) {
  if (!OAUTH_ORIGIN) return false;
  return provider === 'kakao' || !isIpOrigin(OAUTH_ORIGIN);
}

function isIpOrigin(origin: string) {
  try {
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(new URL(origin).hostname);
  } catch {
    return false;
  }
}

/** 동의 화면으로 이동. 돌아온 뒤 처리는 consumeOAuthRedirect가 맡는다. */
export function startSocialLogin(provider: SocialProvider) {
  window.location.assign(`${OAUTH_ORIGIN}/oauth2/authorization/${provider}`);
}

export type OAuthRedirectResult =
  | { status: 'new-user' }
  | { status: 'logged-in' }
  | { status: 'failed' };

/**
 * ⚠️ 확정 아님 — 서버가 어떤 이름으로 토큰을 주는지 몰라 후보를 넓게 받는다.
 *
 * `token`·`access`처럼 흔한 이름은 일부러 뺐다. 이 함수는 라우트와 무관하게 **모든 페이지 로드**에서
 * 돌기 때문에, 초대 링크나 외부 유입의 `?token=`을 액세스 토큰으로 삼켜 버린다.
 */
const ACCESS_TOKEN_PARAMS = ['accessToken', 'access_token'];
const REFRESH_TOKEN_PARAMS = ['refreshToken', 'refresh_token'];
const NEW_USER_PARAMS = ['isNewUser', 'is_new_user', 'newUser'];

/** 후보 이름 중 먼저 값이 있는 것을 고른다. */
function pick(params: URLSearchParams, names: string[]) {
  for (const name of names) {
    const value = params.get(name);
    if (value) return value;
  }
  return null;
}

/**
 * JWT 모양인지. 이름만 맞는 엉뚱한 값을 토큰으로 저장하지 않으려는 최소한의 방어다.
 * 서명을 검증하는 게 아니라 형태만 본다 — 진짜 검증은 서버가 한다.
 */
function looksLikeJwt(value: string) {
  return /^[\w-]+\.[\w-]+\.[\w-]+$/.test(value);
}

/** 참을 나타내는 표기가 서버마다 달라서 넓게 받는다. */
function isTrue(value: string | null) {
  return value !== null && ['true', '1', 'y', 'yes'].includes(value.toLowerCase());
}

/**
 * 로그인 후 되돌아온 것이면 토큰을 저장하고 결과를 돌려준다. 아니면 null.
 *
 * **되돌아오는 경로를 모르기 때문에** 특정 라우트에 매달지 않는다. 어디로 떨어지든 잡아낸다.
 * 토큰이 해시(`#access_token=...`)로 올 수도 있어 쿼리와 해시를 모두 본다.
 */
export function consumeOAuthRedirect(): OAuthRedirectResult | null {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  const accessToken = pick(search, ACCESS_TOKEN_PARAMS) ?? pick(hash, ACCESS_TOKEN_PARAMS);

  if (!accessToken || !looksLikeJwt(accessToken)) {
    // 실패 형태는 확인된 값이다: /login?error=oauth2_failure&message=...
    if (search.get('error') ?? hash.get('error')) return { status: 'failed' };

    // 이름이 후보 목록에 없으면 조용히 지나간다. 파라미터 이름이 확정되기 전까지
    // "왜 로그인이 안 되지"를 추적할 단서가 이것뿐이라 개발 중에만 남긴다.
    if (import.meta.env.DEV && accessToken) {
      console.warn('[oauth] 토큰 모양이 아닌 값을 무시했습니다. 파라미터 이름을 확인하세요.');
    }
    return null;
  }

  const refreshToken = pick(search, REFRESH_TOKEN_PARAMS) ?? pick(hash, REFRESH_TOKEN_PARAMS);
  if (refreshToken) setRefreshToken(refreshToken);
  setAccessToken(accessToken);

  const isNewUser = isTrue(pick(search, NEW_USER_PARAMS) ?? pick(hash, NEW_USER_PARAMS));
  return { status: isNewUser ? 'new-user' : 'logged-in' };
}

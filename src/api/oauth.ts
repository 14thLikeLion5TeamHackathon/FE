import { rememberSocialProvider } from '../lib/socialProvider';
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

/**
 * 동의 화면으로 이동. 돌아온 뒤 처리는 consumeOAuthRedirect가 맡는다.
 *
 * **`redirect_uri`를 반드시 붙인다.** 안 붙이면 서버가 자기 화이트리스트의 **첫 번째** 주소로
 * 되돌려보내는데, 그 첫 항목이 `http://localhost:3000`이라 배포본에서 로그인하면
 * 인증은 성공해 놓고 로컬 주소로 튄다 — 사용자에겐 그냥 실패로 보인다.
 *
 * 서버 순서를 바꾸는 걸로는 못 푼다. 그러면 이번엔 로컬에서 로그인해도 배포본으로 튄다.
 * 각자 자기 주소를 말하는 게 맞다.
 *
 * 서버는 scheme·host·port만 비교하므로(경로는 안 본다) `origin`을 그대로 넘기면 된다.
 * 화이트리스트에 없는 값을 보내면 무시하고 기본값으로 떨어지므로, 새 배포 도메인이
 * 생기면 서버 목록에도 추가해야 한다.
 */
export function startSocialLogin(provider: SocialProvider) {
  // 돌아올 때는 어느 제공자였는지 알 수 없다 — 떠나기 전에 적어 둔다(lib/socialProvider.ts)
  rememberSocialProvider(provider);

  const params = new URLSearchParams({ redirect_uri: window.location.origin });
  window.location.assign(`${OAUTH_ORIGIN}/oauth2/authorization/${provider}?${params}`);
}

export type OAuthRedirectResult =
  { status: 'new-user' } | { status: 'logged-in' } | { status: 'failed' };

/**
 * 서버가 돌려주는 파라미터 이름. **실제 왕복으로 확인한 값이다.**
 *
 *   http://localhost:3000/?token=<JWT>&refresh=<JWT>&isNewUser=true
 *
 * 한때 후보를 넓게 두고 추측했는데, 하필 `token`을 "초대 링크의 `?token=`을 삼킬 수 있다"는
 * 이유로 빼둬서 로그인이 조용히 실패했다. 지금은 확정된 이름만 본다 —
 * 이름이 틀리면 넓게 받는 대신 **아래 DEV 경고로 드러나게** 하는 편이 낫다.
 */
const ACCESS_TOKEN_PARAMS = ['token', 'accessToken', 'access_token'];
const REFRESH_TOKEN_PARAMS = ['refresh', 'refreshToken', 'refresh_token'];
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
 * 아는 이름으로는 못 찾았는데 JWT처럼 생긴 값이 URL에 있으면 알린다.
 *
 * 이름이 바뀌면 로그인은 **아무 에러 없이** 안 되고 `/login`으로 되돌아올 뿐이라,
 * 실제로 이걸 찾는 데 며칠이 걸렸다(서버가 `accessToken`이 아니라 `token`으로 준다).
 * 다음에 이름이 또 바뀌면 콘솔에서 바로 보이게 한다.
 */
function warnIfTokenLookalikeIgnored(search: URLSearchParams, hash: URLSearchParams) {
  if (!import.meta.env.DEV) return;

  for (const params of [search, hash]) {
    for (const [name, value] of params) {
      if (looksLikeJwt(value)) {
        console.warn(
          `[oauth] JWT처럼 보이는 \`${name}\` 파라미터를 무시했습니다. ` +
            `아는 이름은 ${ACCESS_TOKEN_PARAMS.join('/')} 뿐입니다 — api/oauth.ts에 추가하세요.`,
        );
        return;
      }
    }
  }
}

/**
 * 로그인 후 되돌아온 것이면 토큰을 저장하고 결과를 돌려준다. 아니면 null.
 *
 * 서버는 루트(`/`)로 돌려보내지만 특정 라우트에 매달지 않는다 — 어디로 떨어지든 잡아낸다.
 * 토큰이 해시(`#token=...`)로 올 수도 있어 쿼리와 해시를 모두 본다.
 */
export function consumeOAuthRedirect(): OAuthRedirectResult | null {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  const accessToken = pick(search, ACCESS_TOKEN_PARAMS) ?? pick(hash, ACCESS_TOKEN_PARAMS);

  if (!accessToken || !looksLikeJwt(accessToken)) {
    // 실패 형태는 확인된 값이다: /login?error=oauth2_failure&message=...
    if (search.get('error') ?? hash.get('error')) return { status: 'failed' };

    warnIfTokenLookalikeIgnored(search, hash);
    return null;
  }

  const refreshToken = pick(search, REFRESH_TOKEN_PARAMS) ?? pick(hash, REFRESH_TOKEN_PARAMS);
  if (refreshToken) setRefreshToken(refreshToken);
  setAccessToken(accessToken);

  const isNewUser = isTrue(pick(search, NEW_USER_PARAMS) ?? pick(hash, NEW_USER_PARAMS));
  return { status: isNewUser ? 'new-user' : 'logged-in' };
}

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * localStorage는 React 밖의 저장소라 값이 바뀌어도 리렌더가 일어나지 않는다.
 * useSyncExternalStore가 구독할 수 있도록 "바뀌었다"를 알리는 층을 여기 둔다.
 * localStorage 키를 아는 파일은 이 파일 하나로 유지한다.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** useSyncExternalStore의 subscribe. 같은 탭은 emit, 다른 탭은 storage 이벤트로 받는다. */
export function subscribeAccessToken(listener: Listener) {
  listeners.add(listener);

  // storage 이벤트는 이 값을 바꾼 탭에는 오지 않는다. 다른 탭의 로그인/로그아웃 반영용.
  // key가 null이면 localStorage.clear() — 토큰도 함께 날아간 것으로 본다.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === ACCESS_TOKEN_KEY) listener();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** useSyncExternalStore의 getSnapshot. 문자열이라 값 비교로 충분하다. */
export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  emit();
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  emit();
}

/**
 * 리프레시 토큰 보관. 갱신 흐름(POST /api/v1/auth/token/refresh)은 아직 붙이지 않았고,
 * 콜백에서 함께 내려온 값을 버리지 않기 위해서만 저장한다. 구독 대상은 액세스 토큰뿐이라 emit 안 함.
 */
export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

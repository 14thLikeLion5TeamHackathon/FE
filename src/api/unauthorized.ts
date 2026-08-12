/**
 * 401을 React 쪽으로 넘기는 다리.
 *
 * axios 인터셉터는 컴포넌트가 아니라서 useNavigate를 부를 수 없다.
 * 그래서 인터셉터는 "401이 났다"만 알리고, 실제 이동은 앱이 등록한 핸들러가 한다.
 * window.location.replace로 바로 보내는 방법도 있지만 페이지가 통째로 새로고침되어
 * SPA 상태와 쿼리 캐시가 전부 날아가서 쓰지 않는다. (등록 전 안전망으로만 남긴다)
 */
type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler | null = null;

/** 앱 최상단에서 navigate 기반 핸들러를 등록한다. 언마운트 시 null로 해제. */
export function setUnauthorizedHandler(next: UnauthorizedHandler | null) {
  handler = next;
}

export function notifyUnauthorized() {
  if (handler) {
    handler();
    return;
  }

  // 앱이 아직 마운트되기 전에 401이 난 경우의 안전망. 새로고침을 감수한다.
  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

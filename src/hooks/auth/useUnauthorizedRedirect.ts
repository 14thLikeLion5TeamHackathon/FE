import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { setUnauthorizedHandler } from '../../api/unauthorized';

/**
 * 401이 나면 로그인으로 보내는 핸들러를 앱 최상단에서 한 번 등록한다.
 *
 * 토큰 삭제는 인터셉터가 이미 했으므로 가드도 곧 같은 곳으로 보내지만,
 * 가드 밖(공개 라우트)에서 401이 났을 때는 이 핸들러만이 유일한 출구다.
 * 둘 다 replace로 이동하므로 겹쳐도 히스토리는 한 칸만 바뀐다.
 */
export function useUnauthorizedRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  // 위치가 바뀔 때마다 핸들러를 다시 등록하지 않으려고 ref로 최신값만 들고 간다.
  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      const current = locationRef.current;

      // 이미 로그인 화면이면 이동하지 않는다 — 로그인 요청이 401이면 루프가 된다.
      if (current.pathname === '/login') return;

      navigate('/login', { state: { from: current }, replace: true });
    });

    return () => setUnauthorizedHandler(null);
  }, [navigate]);
}

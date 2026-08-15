/**
 * 소셜 로그인 콜백 — BE 리다이렉트로 돌아올 때 쿼리스트링에 실려 오는 토큰을 저장하는 화면.
 *
 * ⚠️ BE와 아직 확정되지 않은 것 (docs/api-contract.md "확인 필요"):
 *   1) 콜백 경로 — 지금은 `/auth/callback`. 바꿀 곳은 AppRoutes.tsx의 라우트 path 한 줄.
 *   2) 토큰 파라미터 이름 — 아래 두 상수. 아직 확인된 값이 아니라 흔한 후보를 넓게 받는 임시 목록이다.
 *   확정되면 이 두 곳만 고치면 된다.
 *
 * 가드 밖에 둔다 — 토큰을 저장하기 전이라 가드 안이면 /login으로 튕겨 쿼리스트링이 사라진다.
 */
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { setAccessToken, setRefreshToken } from '../../api/token';

/** ⚠️ 확정 아님 — BE 확인 후 실제 이름 하나로 줄일 것. */
const ACCESS_TOKEN_PARAMS = ['access', 'accessToken', 'access_token', 'token'];
const REFRESH_TOKEN_PARAMS = ['refresh', 'refreshToken', 'refresh_token'];

function pick(params: URLSearchParams, names: string[]) {
  for (const name of names) {
    const value = params.get(name);
    if (value) return value;
  }
  return null;
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = pick(searchParams, ACCESS_TOKEN_PARAMS);

    // 토큰이 없으면 로그인 실패로 본다(사용자 취소·BE 에러 리다이렉트 포함).
    if (!accessToken) {
      navigate('/login', { replace: true });
      return;
    }

    const refreshToken = pick(searchParams, REFRESH_TOKEN_PARAMS);
    if (refreshToken) setRefreshToken(refreshToken);

    // 토큰이 저장되는 순간 가드가 열린다. replace라 뒤로가기가 콜백 URL로 돌아오지 않는다.
    setAccessToken(accessToken);
    navigate('/', { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="bg-surface-canvas min-h-dvh" aria-busy="true" aria-label="로그인 처리 중" />
  );
}

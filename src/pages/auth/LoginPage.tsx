/**
 * 로그인 — 자리표시자.
 * 담당: 윤서
 *
 * 탭바도 뒤로가기도 없는 진입 화면이라 레이아웃 없이 단독으로 렌더된다.
 * 카카오는 브랜드 색(#FEE500)을 그대로 쓴다 — 토큰으로 만들지 말 것.
 * 실 OAuth와 별개로, 데모용 우회 진입(import.meta.env.DEV 가드)도 함께 만든다.
 */
import { useLocation, useNavigate, useSearchParams, type Location } from 'react-router';

import { isConfigured, startSocialLogin } from '../../api/oauth';
import Logo from '../../components/Logo';
import { useAuth } from '../../hooks/auth/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // BE가 로그인 실패를 이 형태로 되돌려준다: /login?error=oauth2_failure&message=...
  // message는 서버 내부 문구라 그대로 보여주지 않는다.
  const failed = Boolean(searchParams.get('error'));

  const googleAvailable = isConfigured('google');

  // 가드가 튕겨낼 때 넘겨준 원래 목적지. location 객체를 통째로 쓴다 —
  // pathname만 뽑으면 `/cards/3?tab=records`가 `/cards/3`으로 돌아온다.
  const from = (location.state as { from?: Location } | null)?.from;

  /**
   * 데모용 진입. 로그인 API를 부르지 않고 로컬에 가짜 토큰만 심는다.
   * 계약에 로그인 엔드포인트가 없어서(소셜 리다이렉트 방식) 호출할 대상이 없고,
   * VITE_API_BASE_URL이 채워지면 상대경로 MSW 목도 cross-origin이라 매칭되지 않는다.
   */
  function skipLogin() {
    login('dev-access-token');
    navigate(from ?? '/', { replace: true });
  }

  return (
    <div className="bg-surface-canvas max-w-app mx-auto flex min-h-dvh w-full flex-col justify-between px-5 py-10">
      <div />

      <div className="flex flex-col items-center gap-2">
        {/* 원형/사각 플레이스홀더 대신 실제 로고. Logo가 role="img" aria-label="마디"라
            h1은 여기서 접근성 이름을 얻는다 — 별도 텍스트를 두면 중복해서 읽힌다. */}
        <h1>
          <Logo size={36} />
        </h1>
        <p className="typo-body text-text-secondary">개인 맞춤 웰니스 페이스메이커</p>
      </div>

      <div className="flex flex-col gap-3">
        {failed ? (
          <p className="typo-caption text-danger text-center">
            로그인이 완료되지 않았어요. 다시 시도해주세요.
          </p>
        ) : (
          <p className="typo-caption text-text-tertiary text-center">
            소셜 계정으로 로그인 / 회원가입
          </p>
        )}
        {/* API 호출이 아니라 페이지 이동이다 — 자세한 이유는 api/oauth.ts 참고 */}
        <button
          onClick={() => startSocialLogin('kakao')}
          disabled={!isConfigured('kakao')}
          className="typo-body w-full rounded-sm bg-[#FEE500] py-3 font-bold text-black disabled:opacity-40"
        >
          카카오로 계속하기
        </button>
        {/* 구글은 서버에 도메인이 붙기 전까지 감춘다 — 이유는 api/oauth.ts의 isConfigured 참고.
            누를 수 없는 버튼을 남겨두면 "왜 안 되냐"는 질문만 만든다. */}
        {googleAvailable && (
          <button
            onClick={() => startSocialLogin('google')}
            className="typo-body bg-surface-elevated text-text-primary border-border-strong w-full rounded-sm border py-3 font-bold"
          >
            Google로 계속하기
          </button>
        )}
        {import.meta.env.DEV && (
          <button
            onClick={skipLogin}
            className="typo-caption text-text-tertiary mt-2 text-center underline"
          >
            (DEV) 로그인 건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}

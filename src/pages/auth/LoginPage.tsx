/**
 * 로그인 — 자리표시자.
 * 담당: 윤서
 *
 * 탭바도 뒤로가기도 없는 진입 화면이라 레이아웃 없이 단독으로 렌더된다.
 * 카카오는 브랜드 색(#FEE500)을 그대로 쓴다 — 토큰으로 만들지 말 것.
 * 실 OAuth와 별개로, 데모용 우회 진입(import.meta.env.DEV 가드)도 함께 만든다.
 */
import { useLocation, useNavigate, type Location } from 'react-router';

import { useAuth } from '../../hooks/auth/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

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
        <div className="border-primary size-20 rounded-2xl border" aria-hidden />
        <h1 className="typo-title text-primary">Madi</h1>
        <p className="typo-body text-text-secondary">개인 맞춤 웰니스 페이스메이커</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="typo-caption text-text-tertiary text-center">
          소셜 계정으로 로그인 / 회원가입
        </p>
        {/* 실 OAuth 연동 전까지 onClick 없음 */}
        <button className="typo-body w-full rounded-sm bg-[#FEE500] py-3 font-bold text-black">
          카카오로 계속하기
        </button>
        <button className="typo-body bg-surface-elevated text-text-primary border-border-strong w-full rounded-sm border py-3 font-bold">
          Google로 계속하기
        </button>
        <p className="typo-caption text-text-tertiary text-center">
          카카오는 알림 발송, 구글은 캘린더 연동에 함께 쓰여요
        </p>

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

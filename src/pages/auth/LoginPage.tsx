/**
 * 로그인 — 자리표시자.
 * 담당: 윤서
 *
 * 탭바도 뒤로가기도 없는 진입 화면이라 레이아웃 없이 단독으로 렌더된다.
 * 카카오는 브랜드 색(#FEE500)을 그대로 쓴다 — 토큰으로 만들지 말 것.
 * 실 OAuth와 별개로, 데모용 우회 진입(import.meta.env.DEV 가드)도 함께 만든다.
 */
export default function LoginPage() {
  return (
    <div className="bg-surface-canvas max-w-app mx-auto flex min-h-dvh w-full flex-col justify-center px-5">
      <h1 className="typo-title text-primary text-center">Madi</h1>
      <p className="typo-body text-text-secondary mt-2 text-center">준비 중이에요.</p>
    </div>
  );
}

import NavHeader from '../../components/NavHeader';

/**
 * 회원가입 — 자리표시자.
 * 담당: 윤서
 *
 * 기본 정보 → 약관 동의 2스텝. 하단 고정 CTA(BottomCTA)를 쓴다.
 * 일정 데이터 활용 동의는 **선택**이다 — 미동의로도 가입되어야 한다.
 *
 * 시안을 보고 이 파일 안을 채우면 된다. 라우트는 이미 연결돼 있다.
 */
export default function SignupPage() {
  return (
    <div className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
      <NavHeader title="회원가입" />
      <p className="typo-body text-text-secondary">준비 중이에요.</p>
    </div>
  );
}

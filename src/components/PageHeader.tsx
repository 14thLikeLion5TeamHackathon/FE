import Logo from './Logo';

type PageHeaderProps = {
  title: string;
};

/**
 * 탭 화면(오늘·회복·마이) 상단 헤더. 서브페이지는 NavHeader를 쓴다.
 *
 * 로고는 심볼만, 제목 왼쪽에 붙인다. 워드마크("마디")까지 넣으면 바로 옆 제목과
 * 같은 굵기·크기의 글자가 두 덩어리 나란히 놓여 어느 쪽이 화면 이름인지 흐려진다.
 * 워드마크가 있는 전체 로고는 진입 화면(LoginPage)에만 쓴다.
 */
export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="flex items-center gap-2">
      {/* 제목이 h1이라 로고는 장식이다 — 스크린리더가 "마디 오늘"로 읽지 않게 감춘다.
            Logo 자체가 role="img"라 바깥에서 subtree째 가린다. */}
      <span aria-hidden>
        <Logo symbolOnly size={22} />
      </span>
      <h1 className="typo-title">{title}</h1>
    </header>
  );
}

import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

import Logo from './Logo';

type NavHeaderProps = {
  title: string;
  /** 뒤로가기 동작. 기본은 브라우저 히스토리 뒤로. */
  onBack?: () => void;
  /** 우측에 붙일 요소 (건너뛰기 버튼 등) */
  action?: ReactNode;
};

/**
 * 서브페이지 상단 헤더. 탭 화면(오늘·회복·마이)은 PageHeader를 쓴다.
 * 시안 규격: 뒤로가기 화살표 + typo-title 제목, 간격 14.
 *
 * 로고를 제목 왼쪽에 붙여 탭 화면(PageHeader)과 같은 자리에 둔다 —
 * 서브페이지로 들어갔을 때 상단이 갑자기 달라 보이지 않게 하려는 것이다.
 */
export default function NavHeader({ title, onBack, action }: NavHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-3.5">
      <button
        type="button"
        onClick={onBack ?? (() => navigate(-1))}
        aria-label="뒤로"
        className="-m-2 p-2"
      >
        <svg viewBox="0 0 8 14" className="h-3.5 w-2" fill="none" aria-hidden>
          <path
            d="M7 1L1 7l6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* 제목이 h1이라 로고는 장식이다 — 스크린리더가 "마디 상태 기록"으로 읽지 않게 감춘다 */}
      <span aria-hidden className="-mr-1.5">
        <Logo symbolOnly size={22} />
      </span>
      <h1 className="typo-title flex-1">{title}</h1>
      {action}
    </header>
  );
}

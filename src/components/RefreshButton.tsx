import { cn } from '../lib/cn';

type RefreshButtonProps = {
  onClick: () => void;
  /** 조회 중이면 아이콘을 돌리고 중복 클릭을 막는다 */
  isRefreshing?: boolean;
};

/**
 * 카드 헤더 우측에 붙는 새로고침 아이콘 버튼.
 * 브리핑·체크리스트처럼 별도 쿼리로 도는 카드에서 에러가 아니어도
 * 사용자가 수동으로 최신 데이터를 다시 불러올 수 있게 상시 노출한다.
 */
export default function RefreshButton({ onClick, isRefreshing = false }: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isRefreshing}
      aria-label="새로고침"
      className="text-text-tertiary -m-2 shrink-0 p-2 disabled:opacity-60"
    >
      <svg
        viewBox="0 0 14 14"
        className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')}
        fill="none"
        aria-hidden
      >
        <path
          d="M12.5 7A5.5 5.5 0 1 1 10.6 2.9"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M13 2v3.5H9.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

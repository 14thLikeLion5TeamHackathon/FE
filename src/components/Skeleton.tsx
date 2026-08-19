import { cn } from '../lib/cn';

type SkeletonProps = {
  /** 실제 콘텐츠가 차지할 높이. 다 그려진 뒤 레이아웃이 튀지 않게 비슷하게 맞춘다 */
  className?: string;
};

/**
 * 로딩 자리표시자.
 *
 * "불러오는 중..." 같은 글자 대신 쓰는 이유는, 곧 나타날 것의 **모양**을 미리 보여주면
 * 사용자가 화면이 살아 있다고 느끼고 실제 대기 시간도 짧게 느끼기 때문이다.
 * 그래서 높이·개수를 실제 콘텐츠에 맞춰 넘기는 게 중요하다 — 아무 크기나 쓰면
 * 데이터가 도착할 때 레이아웃이 튄다.
 *
 * 화면 낭독기에는 이 상자들이 의미가 없다. 감싸는 쪽에서 `aria-busy="true"`를 준다.
 */
export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-surface-raised rounded-md animate-pulse', className)} aria-hidden />
  );
}

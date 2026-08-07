import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

type SegmentProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

/**
 * 시안 `Segment` (Figma `공용 컴포넌트` > Segment).
 * 2개 이상 중 하나를 고르는 자리에 쓴다 — 성별 · 방문 경험 · 증상 강도.
 * 옵션 하나가 이 컴포넌트고, 나란히 놓는 건 쓰는 쪽에서 flex로 감싼다.
 *
 * 선택 상태는 **은은한 tint 배경 + 스카이 테두리 + 스카이 글자**다.
 * 꽉 찬 primary 배경이 아니다 — 화면당 primary는 4곳을 넘기지 않는다.
 */
export default function Segment({ selected = false, className, children, ...props }: SegmentProps) {
  return (
    <button
      type="button"
      className={cn(
        // 공통 — 세로 패딩 13. 굵기는 typo-body가 정하므로 따로 주지 않는다.
        'typo-body rounded-md flex-1 px-0 py-[13px] text-center transition-colors select-none',

        selected
          ? 'bg-primary-tint text-primary border-primary border-[1.5px]'
          : 'bg-surface-fill text-text-secondary',

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

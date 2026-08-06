import type { ReactNode } from 'react';

import { cn } from '../lib/cn';

type CardProps = {
  children: ReactNode;
  /**
   * list  — 행(SettingRow 등)을 담는 카드. 좌우 패딩만 주고 상하는 행이 갖는다.
   * block — 일반 콘텐츠 카드. 사방 패딩.
   */
  variant?: 'list' | 'block';
  className?: string;
};

/** 시안의 `Card`. 배경 surface-raised + radius-card 고정. */
export default function Card({ children, variant = 'block', className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface-raised rounded-card',
        variant === 'list' ? 'px-4' : 'p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

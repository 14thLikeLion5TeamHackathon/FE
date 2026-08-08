import type { ReactNode } from 'react';

import { cn } from '../lib/cn';

type SectionHeaderProps = {
  title: string;
  action?: ReactNode;
  className?: string;
};

/** 시안의 `SectionHeader`. 좌측 제목 + 우측 옵션 액션(D-day 등). */
export default function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h2 className="typo-section text-text-secondary">{title}</h2>
      {action}
    </div>
  );
}

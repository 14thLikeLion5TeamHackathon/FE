import type { ReactNode } from 'react';

import Card from './Card';
import { cn } from '../lib/cn';

type EmptyStateCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * 빈 상태 카드.
 *
 * 배경·모서리·패딩은 `Card`에 맡기고 가운데 정렬만 얹는다.
 * 직접 그리면 radius가 어긋난다 — `rounded-md`(10px)는 입력 필드·세그먼트용이고
 * 카드는 `rounded-card`(20px)라, 실제 `Card` 옆에 놓였을 때 모서리가 눈에 띄게 안 맞는다.
 */
export default function EmptyStateCard({
  title,
  description,
  action,
  className,
}: EmptyStateCardProps) {
  return (
    <Card className={cn('flex flex-col items-center gap-3', className)}>
      <p className="typo-card-title">{title}</p>
      {description && <p className="typo-caption text-text-tertiary">{description}</p>}
      {action}
    </Card>
  );
}

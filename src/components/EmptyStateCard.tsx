import type { ReactNode } from 'react';

import Card from './Card';
import { cn } from '../lib/cn';

type EmptyStateCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyStateCard({
  title,
  description,
  action,
  className,
}: EmptyStateCardProps) {
  return (
    <Card className={cn('flex flex-col items-stretch gap-3', className)}>
      <p className="typo-body text-text-secondary self-stretch">{title}</p>
      {description && <p className="typo-caption text-text-tertiary">{description}</p>}
      {action}
    </Card>
  );
}
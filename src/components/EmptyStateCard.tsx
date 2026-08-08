import type { ReactNode } from 'react';

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
    <div
      className={cn(
        'bg-surface-raised border-border-subtle flex flex-col items-center gap-3 rounded-md border p-4',
        className,
      )}
    >
      <p className="typo-card-title">{title}</p>
      {description && <p className="typo-caption text-text-tertiary">{description}</p>}
      {action}
    </div>
  );
}

import * as React from 'react';
import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'purple';

interface StatusBadgeProps {
  variant?: StatusVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-orange-50 text-orange-700 border-orange-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-lera-50 text-lera-800 border-lera-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  default: 'bg-gray-50 text-gray-700 border-gray-200',
};

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-green-500',
  warning: 'bg-orange-500',
  error: 'bg-red-500',
  info: 'bg-lera-800',
  purple: 'bg-purple-500',
  default: 'bg-gray-500',
};

export function StatusBadge({
  variant = 'default',
  children,
  className,
  dot = false,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotStyles[variant])} />
      )}
      {children}
    </span>
  );
}

// Pre-configured status badges for common use cases
export function PaidBadge() {
  return <StatusBadge variant="success">Paid</StatusBadge>;
}

export function PendingBadge() {
  return <StatusBadge variant="warning">Pending</StatusBadge>;
}

export function DraftBadge() {
  return <StatusBadge variant="default">Draft</StatusBadge>;
}

export function ApprovedBadge() {
  return <StatusBadge variant="success">Approved</StatusBadge>;
}

export function InProgressBadge() {
  return <StatusBadge variant="info">In Progress</StatusBadge>;
}

export function ReviewBadge() {
  return <StatusBadge variant="purple">In Review</StatusBadge>;
}

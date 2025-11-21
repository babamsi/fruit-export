'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TransactionStatus, ContainerStatus } from '@/lib/types';
import { getStatusColor } from '@/lib/utils/formatters';

interface StatusBadgeProps {
  status: TransactionStatus | ContainerStatus | 'low-stock' | 'in-stock';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = getStatusBadgeVariant(status);
  const colorClass = getStatusColor(status);

  return (
    <Badge
      variant={variant}
      className={cn(colorClass, className)}
    >
      {status}
    </Badge>
  );
}

// Fix getStatusBadgeVariant import issue
export function getStatusBadgeVariant(
  status: TransactionStatus | ContainerStatus | 'low-stock' | 'in-stock'
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'Fully Paid' || status === 'Delivered' || status === 'in-stock') {
    return 'default';
  }
  if (status === 'Pending' || status === 'Preparing') {
    return 'secondary';
  }
  if (status === 'Partially Paid' || status === 'In Transit') {
    return 'outline';
  }
  return 'destructive';
}


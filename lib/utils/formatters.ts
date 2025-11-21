import { format, parseISO } from 'date-fns';
import type {
  TransactionStatus,
  ContainerStatus,
  PackagingItem,
} from '@/lib/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

export function getStatusBadgeVariant(
  status: TransactionStatus | ContainerStatus | 'low-stock' | 'in-stock'
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'Fully Paid' || status === 'Delivered' || status === 'in-stock') {
    return 'default'; // Green
  }
  if (status === 'Pending' || status === 'Preparing') {
    return 'secondary'; // Yellow
  }
  if (status === 'Partially Paid' || status === 'In Transit') {
    return 'outline'; // Yellow/Blue
  }
  return 'destructive'; // Red (Overdue/Low Stock)
}

export function getStatusColor(status: TransactionStatus | ContainerStatus | 'low-stock' | 'in-stock'): string {
  if (status === 'Fully Paid' || status === 'Delivered' || status === 'in-stock') {
    return 'text-green-600 bg-green-50 border-green-200';
  }
  if (status === 'Pending' || status === 'Preparing') {
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  }
  if (status === 'Partially Paid' || status === 'In Transit') {
    return 'text-blue-600 bg-blue-50 border-blue-200';
  }
  return 'text-red-600 bg-red-50 border-red-200';
}

export function isLowStock(item: PackagingItem): boolean {
  return item.quantity < item.minQuantity;
}


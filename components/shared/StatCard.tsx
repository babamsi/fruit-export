'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/formatters';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  formatAsCurrency?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  formatAsCurrency = false,
}: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-yellow-200 bg-yellow-50/50',
    danger: 'border-red-200 bg-red-50/50',
  };

  return (
    <Card className={cn('border', variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatAsCurrency ? formatCurrency(Number(value)) : value}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend.value > 0 ? '+' : ''}{trend.value} {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}




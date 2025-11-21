'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/DataTable';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Transaction } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function RecentTransactions() {
  const transactions = useTransactionStore((state) => state.transactions);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      cell: (row: Transaction) => formatDate(row.date),
    },
    {
      key: 'supplier',
      header: 'Supplier',
      cell: (row: Transaction) => (
        <div>
          <div className="font-medium">{row.supplierName}</div>
          <div className="text-sm text-muted-foreground">{row.fruitType}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (row: Transaction) => formatCurrency(row.amount),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: Transaction) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link href="/transactions">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={recentTransactions}
          columns={columns}
          emptyMessage="No transactions found."
        />
      </CardContent>
    </Card>
  );
}




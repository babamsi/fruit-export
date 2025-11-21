'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useSupplierStore } from '@/lib/stores/supplierStore';
import { useExpenseStore } from '@/lib/stores/expenseStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { DataTable } from '@/components/shared/DataTable';
import { formatCurrency } from '@/lib/utils/formatters';
import type { ExpenseCategory } from '@/lib/types';

export default function ReportsPage() {
  const suppliers = useSupplierStore((state) => state.suppliers);
  const expenses = useExpenseStore((state) => state.expenses);
  const transactions = useTransactionStore((state) => state.transactions);

  const expenseCategories: ExpenseCategory[] = [
    'Supplier Payment',
    'Packaging Materials',
    'Shipping',
    'Labor',
    'Other',
  ];

  const categoryTotals = expenseCategories.map((category) => {
    const categoryExpenses = expenses.filter((e) => e.category === category);
    return {
      category,
      total: categoryExpenses.reduce((sum, e) => sum + e.amount, 0),
      count: categoryExpenses.length,
    };
  });

  const supplierSummary = suppliers.map((supplier) => {
    const supplierTransactions = transactions.filter(
      (t) => t.supplierId === supplier.id
    );
    return {
      name: supplier.name,
      totalOwed: supplier.totalOwed,
      totalPaid: supplier.totalPaid,
      balance: supplier.balance,
      transactionCount: supplierTransactions.length,
    };
  });

  const handleExportCSV = () => {
    // Simple CSV export
    const csvData = [
      ['Report', 'Value'],
      ['Total Suppliers', suppliers.length.toString()],
      ['Total Transactions', transactions.length.toString()],
      ['Total Expenses', expenses.reduce((sum, e) => sum + e.amount, 0).toString()],
      ...categoryTotals.map((c) => [c.category, c.total.toString()]),
    ];

    const csvContent = csvData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fruit-export-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const categoryColumns = [
    {
      key: 'category',
      header: 'Category',
      cell: (row: typeof categoryTotals[0]) => row.category,
    },
    {
      key: 'count',
      header: 'Count',
      cell: (row: typeof categoryTotals[0]) => row.count,
    },
    {
      key: 'total',
      header: 'Total',
      cell: (row: typeof categoryTotals[0]) => formatCurrency(row.total),
    },
  ];

  const supplierColumns = [
    {
      key: 'name',
      header: 'Supplier',
      cell: (row: typeof supplierSummary[0]) => row.name,
    },
    {
      key: 'transactionCount',
      header: 'Transactions',
      cell: (row: typeof supplierSummary[0]) => row.transactionCount,
    },
    {
      key: 'totalOwed',
      header: 'Total Owed',
      cell: (row: typeof supplierSummary[0]) => formatCurrency(row.totalOwed),
    },
    {
      key: 'totalPaid',
      header: 'Total Paid',
      cell: (row: typeof supplierSummary[0]) => formatCurrency(row.totalPaid),
    },
    {
      key: 'balance',
      header: 'Balance',
      cell: (row: typeof supplierSummary[0]) => (
        <span className={row.balance > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
          {formatCurrency(row.balance)}
        </span>
      ),
    },
  ];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPendingPayments = transactions
    .filter((t) => t.status === 'Pending' || t.status === 'Partially Paid')
    .reduce((sum, t) => sum + t.remainingBalance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive business insights and summaries
          </p>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={categoryTotals}
            columns={categoryColumns}
            emptyMessage="No expense data available."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={supplierSummary}
            columns={supplierColumns}
            emptyMessage="No supplier data available."
          />
        </CardContent>
      </Card>
    </div>
  );
}


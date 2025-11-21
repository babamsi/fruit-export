'use client';

import { useState, useEffect } from 'react';
import { useSupplierStore } from '@/lib/stores/supplierStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useInvoiceStore } from '@/lib/stores/invoiceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, DollarSign, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Transaction, Invoice } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SupplierDetailsProps {
  supplierId: string;
}

export function SupplierDetails({ supplierId }: SupplierDetailsProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use selectors that cache properly - get the entire arrays first
  const allSuppliers = useSupplierStore((state) => state.suppliers);
  const allTransactions = useTransactionStore((state) => state.transactions);
  const allInvoices = useInvoiceStore((state) => state.invoices);

  // Compute derived data only after mounting
  const supplier = isMounted ? allSuppliers.find((s) => s.id === supplierId) : undefined;
  const transactions = isMounted 
    ? allTransactions.filter((t) => t.supplierId === supplierId)
    : [];
  const invoices = isMounted
    ? allInvoices.filter((i) => i.supplierId === supplierId)
    : [];

  if (!isMounted) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Supplier not found</p>
        <Button onClick={() => router.push('/suppliers')} className="mt-4">
          Back to Suppliers
        </Button>
      </div>
    );
  }

  const transactionColumns = [
    {
      key: 'date',
      header: 'Date',
      cell: (row: Transaction) => formatDate(row.date),
    },
    {
      key: 'fruitType',
      header: 'Fruit Type',
      cell: (row: Transaction) => (
        <div>
          <div className="font-medium">{row.fruitType}</div>
          <div className="text-sm text-muted-foreground">
            Qty: {row.quantity}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (row: Transaction) => formatCurrency(row.amount),
    },
    {
      key: 'remainingBalance',
      header: 'Remaining',
      cell: (row: Transaction) => (
        <div>
          {row.remainingBalance > 0 ? (
            <span className="text-red-600 font-medium">
              {formatCurrency(row.remainingBalance)}
            </span>
          ) : (
            <span className="text-green-600">{formatCurrency(0)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: Transaction) => <StatusBadge status={row.status} />,
    },
  ];

  const invoiceColumns = [
    {
      key: 'date',
      header: 'Date',
      cell: (row: Invoice) => formatDate(row.date),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (row: Invoice) => formatCurrency(row.amount),
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      cell: (row: Invoice) => row.paymentMethod,
    },
    {
      key: 'transactionsCleared',
      header: 'Transactions Cleared',
      cell: (row: Invoice) => row.transactionsCleared.length,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: Invoice) => (
        <Link href={`/invoices?view=${row.id}`}>
          <Button variant="outline" size="sm">
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/suppliers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
          <p className="text-muted-foreground">{supplier.contact}</p>
        </div>
        <Link href={`/invoices/create?supplier=${supplier.id}`}>
          <Button>
            <DollarSign className="h-4 w-4 mr-2" />
            Create Payment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Owed"
          value={supplier.totalOwed}
          icon={DollarSign}
          formatAsCurrency
          variant={supplier.totalOwed > 0 ? 'danger' : 'default'}
        />
        <StatCard
          title="Total Paid"
          value={supplier.totalPaid}
          icon={Receipt}
          formatAsCurrency
          variant="success"
        />
        <StatCard
          title="Balance"
          value={supplier.balance}
          icon={DollarSign}
          formatAsCurrency
          variant={supplier.balance > 0 ? 'danger' : 'success'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1">{supplier.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="mt-1">{supplier.phone}</p>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Fruit Specialties
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {supplier.fruitSpecialties.map((fruit) => (
                  <span
                    key={fruit}
                    className="bg-secondary px-3 py-1 rounded-md text-sm"
                  >
                    {fruit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <DataTable
            data={transactions}
            columns={transactionColumns}
            emptyMessage="No transactions found for this supplier."
          />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <DataTable
            data={invoices}
            columns={invoiceColumns}
            emptyMessage="No payment invoices found for this supplier."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}


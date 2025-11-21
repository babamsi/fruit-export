'use client';

import { useState } from 'react';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useSupplierStore } from '@/lib/stores/supplierStore';
import { DataTable } from '@/components/shared/DataTable';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TransactionForm } from './TransactionForm';
import type { Transaction } from '@/lib/types';
import type { TransactionStatus } from '@/lib/types';

export function TransactionList() {
  const transactions = useTransactionStore((state) => state.transactions);
  const suppliers = useSupplierStore((state) => state.suppliers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.fruitType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSupplier =
      selectedSupplier === 'all' || transaction.supplierId === selectedSupplier;
    const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;

    return matchesSearch && matchesSupplier && matchesStatus;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSupplier('all');
    setSelectedStatus('all');
  };

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
      key: 'quantity',
      header: 'Quantity',
      cell: (row: Transaction) => row.quantity.toLocaleString(),
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <SearchBar placeholder="Search transactions..." onSearch={setSearchQuery} />
        <FilterBar onClear={handleClearFilters}>
          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partially Paid">Partially Paid</SelectItem>
              <SelectItem value="Fully Paid">Fully Paid</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>
      </div>

      <DataTable
        data={filteredTransactions}
        columns={columns}
        emptyMessage="No transactions found. Add your first transaction to get started."
      />

      <TransactionForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}




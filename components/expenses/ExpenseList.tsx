'use client';

import { useState } from 'react';
import { useExpenseStore } from '@/lib/stores/expenseStore';
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
import { ExpenseForm } from './ExpenseForm';
import type { Expense, ExpenseCategory } from '@/lib/types';

export function ExpenseList() {
  const expenses = useExpenseStore((state) => state.expenses);
  const suppliers = useSupplierStore((state) => state.suppliers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    const matchesSupplier =
      selectedSupplier === 'all' || expense.supplierId === selectedSupplier;

    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSupplier('all');
  };

  const expenseCategories: ExpenseCategory[] = [
    'Supplier Payment',
    'Packaging Materials',
    'Shipping',
    'Labor',
    'Other',
  ];

  const columns = [
    {
      key: 'date',
      header: 'Date',
      cell: (row: Expense) => formatDate(row.date),
    },
    {
      key: 'category',
      header: 'Category',
      cell: (row: Expense) => (
        <span className="bg-secondary px-2 py-1 rounded text-sm">{row.category}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (row: Expense) => (
        <div>
          <div className="font-medium">{row.description}</div>
          {row.supplierId && (
            <div className="text-sm text-muted-foreground">
              Supplier: {suppliers.find((s) => s.id === row.supplierId)?.name || '-'}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (row: Expense) => (
        <div className="text-right font-medium">{formatCurrency(row.amount)}</div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Total Expenses (Filtered)</div>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <SearchBar placeholder="Search expenses..." onSearch={setSearchQuery} />
        <FilterBar onClear={handleClearFilters}>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {expenseCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
        </FilterBar>
      </div>

      <DataTable
        data={filteredExpenses}
        columns={columns}
        emptyMessage="No expenses found. Add your first expense to get started."
      />

      <ExpenseForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}




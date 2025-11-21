'use client';

import { useState } from 'react';
import { useSupplierStore } from '@/lib/stores/supplierStore';
import { DataTable } from '@/components/shared/DataTable';
import { SearchBar } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import { SupplierForm } from './SupplierForm';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import type { Supplier } from '@/lib/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function SupplierList() {
  const suppliers = useSupplierStore((state) => state.suppliers);
  const deleteSupplier = useSupplierStore((state) => state.deleteSupplier);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();
  const [selectedSupplierForTransaction, setSelectedSupplierForTransaction] = useState<string | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleAddTransaction = (supplier: Supplier, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSupplierForTransaction(supplier.id);
    setIsTransactionFormOpen(true);
  };

  const confirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete.id);
      toast.success('Supplier deleted successfully');
      setSupplierToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      cell: (row: Supplier) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-muted-foreground">{row.contact}</div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact',
      cell: (row: Supplier) => (
        <div>
          <div>{row.email}</div>
          <div className="text-sm text-muted-foreground">{row.phone}</div>
        </div>
      ),
    },
    {
      key: 'fruitSpecialties',
      header: 'Specialties',
      cell: (row: Supplier) => (
        <div className="flex flex-wrap gap-1">
          {row.fruitSpecialties.slice(0, 3).map((fruit) => (
            <span
              key={fruit}
              className="text-xs bg-secondary px-2 py-1 rounded"
            >
              {fruit}
            </span>
          ))}
          {row.fruitSpecialties.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{row.fruitSpecialties.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      cell: (row: Supplier) => (
        <div className="text-right">
          <div className={row.balance > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
            {formatCurrency(row.balance)}
          </div>
          <div className="text-xs text-muted-foreground">
            Paid: {formatCurrency(row.totalPaid)}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: Supplier) => (
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={(e) => handleAddTransaction(row, e)}
            title="Add fruit transaction"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add Fruit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Button onClick={() => {
          setSelectedSupplier(undefined);
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <SearchBar
        placeholder="Search suppliers..."
        onSearch={setSearchQuery}
      />

      <DataTable
        data={filteredSuppliers}
        columns={columns}
        onRowClick={(supplier) => {
          window.location.href = `/suppliers/${supplier.id}`;
        }}
        emptyMessage="No suppliers found. Add your first supplier to get started."
      />

      <SupplierForm
        supplier={selectedSupplier}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <TransactionForm
        supplierId={selectedSupplierForTransaction}
        open={isTransactionFormOpen}
        onOpenChange={(open) => {
          setIsTransactionFormOpen(open);
          if (!open) {
            setSelectedSupplierForTransaction(undefined);
          }
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {supplierToDelete?.name} from your system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}



'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSupplyStore } from '@/lib/stores/supplyStore';
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
import { Plus, Trash2, Edit } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { SupplyForm } from './SupplyForm';
import type { Supply } from '@/lib/types';
import { toast } from 'sonner';
import { useContainerStore } from '@/lib/stores/containerStore';
import { useSupplierStore } from '@/lib/stores/supplierStore';
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

export function SupplyList() {
  const searchParams = useSearchParams();
  const containerIdFromUrl = searchParams.get('container');
  
  const supplies = useSupplyStore((state) => state.supplies);
  const deleteSupply = useSupplyStore((state) => state.deleteSupply);
  const containers = useContainerStore((state) => state.containers);
  const suppliers = useSupplierStore((state) => state.suppliers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContainer, setSelectedContainer] = useState<string>(
    containerIdFromUrl || 'all'
  );
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<Supply | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplyToDelete, setSupplyToDelete] = useState<Supply | null>(null);

  // Auto-open form if container is specified in URL
  useEffect(() => {
    if (containerIdFromUrl && containers.some((c) => c.id === containerIdFromUrl)) {
      setIsFormOpen(true);
    }
  }, [containerIdFromUrl, containers]);

  const filteredSupplies = supplies.filter((supply) => {
    const matchesSearch =
      supply.containerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supply.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supply.fruitType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supply.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesContainer =
      selectedContainer === 'all' || supply.containerId === selectedContainer;
    const matchesSupplier =
      selectedSupplier === 'all' || supply.supplierId === selectedSupplier;

    return matchesSearch && matchesContainer && matchesSupplier;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedContainer('all');
    setSelectedSupplier('all');
  };

  const handleEdit = (supply: Supply) => {
    setSelectedSupply(supply);
    setIsFormOpen(true);
  };

  const handleDelete = (supply: Supply) => {
    setSupplyToDelete(supply);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (supplyToDelete) {
      deleteSupply(supplyToDelete.id);
      toast.success('Supply deleted successfully');
      setSupplyToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const totalAmount = filteredSupplies.reduce((sum, supply) => sum + supply.totalAmount, 0);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      cell: (row: Supply) => formatDate(row.date),
    },
    {
      key: 'containerNumber',
      header: 'Container',
      cell: (row: Supply) => (
        <div>
          <div className="font-medium">{row.containerNumber}</div>
        </div>
      ),
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      cell: (row: Supply) => row.supplierName,
    },
    {
      key: 'fruitType',
      header: 'Fruit Type',
      cell: (row: Supply) => row.fruitType,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      cell: (row: Supply) => row.quantity.toLocaleString(),
    },
    {
      key: 'price',
      header: 'Price/Unit',
      cell: (row: Supply) => formatCurrency(row.price),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      cell: (row: Supply) => (
        <div className="font-medium text-right">{formatCurrency(row.totalAmount)}</div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      cell: (row: Supply) => (
        <div className="max-w-xs truncate text-sm text-muted-foreground" title={row.details}>
          {row.details || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: Supply) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            <Edit className="h-4 w-4" />
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
        <h1 className="text-2xl font-bold">Supplies</h1>
        <Button
          onClick={() => {
            setSelectedSupply(undefined);
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Supply
        </Button>
      </div>

      {filteredSupplies.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Supplies (Filtered)</div>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {filteredSupplies.length} suppl{filteredSupplies.length === 1 ? 'y' : 'ies'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <SearchBar placeholder="Search supplies..." onSearch={setSearchQuery} />
        <FilterBar onClear={handleClearFilters}>
          <Select value={selectedContainer} onValueChange={setSelectedContainer}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by container" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Containers</SelectItem>
              {containers.map((container) => (
                <SelectItem key={container.id} value={container.id}>
                  {container.containerNumber}
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
        data={filteredSupplies}
        columns={columns}
        emptyMessage="No supplies found. Register your first supply to get started."
      />

      <SupplyForm
        supply={selectedSupply}
        containerId={containerIdFromUrl || undefined}
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setSelectedSupply(undefined);
          }
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this supply record.
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


'use client';

import { useState } from 'react';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import { DataTable } from '@/components/shared/DataTable';
import { SearchBar } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { InventoryForm } from './InventoryForm';
import type { PackagingItem } from '@/lib/types';
import { toast } from 'sonner';
import { isLowStock } from '@/lib/utils/formatters';

export function InventoryList() {
  const items = useInventoryStore((state) => state.items);
  const restockItem = useInventoryStore((state) => state.restockItem);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PackagingItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = filteredItems.filter((item) => isLowStock(item));

  const handleRestock = () => {
    if (!selectedItem || !restockQuantity) {
      toast.error('Please enter a quantity');
      return;
    }

    restockItem(selectedItem.id, parseInt(restockQuantity));
    toast.success(`Restocked ${restockQuantity} ${selectedItem.unit}`);
    setIsRestockOpen(false);
    setRestockQuantity('');
    setSelectedItem(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'Item',
      cell: (row: PackagingItem) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            {row.name}
            {isLowStock(row) && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="text-sm text-muted-foreground">{row.category}</div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      cell: (row: PackagingItem) => (
        <div className={isLowStock(row) ? 'text-red-600 font-medium' : ''}>
          {row.quantity} {row.unit}
        </div>
      ),
    },
    {
      key: 'minQuantity',
      header: 'Min Quantity',
      cell: (row: PackagingItem) => `${row.minQuantity} ${row.unit}`,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: PackagingItem) => (
        <StatusBadge status={isLowStock(row) ? 'low-stock' : 'in-stock'} />
      ),
    },
    {
      key: 'lastRestocked',
      header: 'Last Restocked',
      cell: (row: PackagingItem) =>
        row.lastRestocked ? formatDate(row.lastRestocked) : '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: PackagingItem) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem(row);
            setIsRestockOpen(true);
          }}
        >
          Restock
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below minimum quantity
            </span>
          </div>
        </div>
      )}

      <SearchBar placeholder="Search inventory..." onSearch={setSearchQuery} />

      <DataTable
        data={filteredItems}
        columns={columns}
        emptyMessage="No inventory items found. Add your first item to get started."
      />

      <InventoryForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Add quantity to {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restockQuantity">Quantity to Add</Label>
              <Input
                id="restockQuantity"
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                placeholder={`Current: ${selectedItem?.quantity} ${selectedItem?.unit}`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestock}>Restock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}




'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import type { PackagingItem } from '@/lib/types';
import { toast } from 'sonner';

interface InventoryFormProps {
  item?: PackagingItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryForm({ item, open, onOpenChange }: InventoryFormProps) {
  const addItem = useInventoryStore((state) => state.addItem);
  const updateItem = useInventoryStore((state) => state.updateItem);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    minQuantity: '',
    unit: 'pieces',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity.toString(),
        minQuantity: item.minQuantity.toString(),
        unit: item.unit,
      });
    } else {
      setFormData({
        name: '',
        category: '',
        quantity: '',
        minQuantity: '',
        unit: 'pieces',
      });
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.quantity || !formData.minQuantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const itemData = {
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      minQuantity: parseInt(formData.minQuantity),
      unit: formData.unit,
    };

    if (item) {
      updateItem(item.id, itemData);
      toast.success('Item updated successfully');
    } else {
      addItem(itemData);
      toast.success('Item added successfully');
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update item information below.' : 'Add a new item to your inventory.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minQuantity">Min Quantity *</Label>
              <Input
                id="minQuantity"
                type="number"
                min="0"
                value={formData.minQuantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, minQuantity: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, unit: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="rolls">Rolls</SelectItem>
                  <SelectItem value="sheets">Sheets</SelectItem>
                  <SelectItem value="pallets">Pallets</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{item ? 'Update' : 'Add'} Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}




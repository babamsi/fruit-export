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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupplyStore } from '@/lib/stores/supplyStore';
import { useContainerStore } from '@/lib/stores/containerStore';
import { useSupplierStore } from '@/lib/stores/supplierStore';
import type { Supply } from '@/lib/types';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/formatters';

interface SupplyFormProps {
  supply?: Supply;
  containerId?: string; // Pre-select container when opened from container details
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fruitTypesList = [
  'Apples',
  'Bananas',
  'Oranges',
  'Grapes',
  'Mangoes',
  'Pineapples',
  'Berries',
  'Avocados',
];

export function SupplyForm({ supply, containerId: initialContainerId, open, onOpenChange }: SupplyFormProps) {
  const addSupply = useSupplyStore((state) => state.addSupply);
  const updateSupply = useSupplyStore((state) => state.updateSupply);
  const containers = useContainerStore((state) => state.containers);
  const suppliers = useSupplierStore((state) => state.suppliers);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    containerId: initialContainerId || '',
    supplierId: '',
    details: '',
    fruitType: '',
    quantity: '',
    price: '',
  });

  // Auto-calculate total amount
  const totalAmount = formData.quantity && formData.price
    ? parseFloat(formData.quantity) * parseFloat(formData.price)
    : 0;

  useEffect(() => {
    if (supply) {
      setFormData({
        date: supply.date.split('T')[0],
        containerId: supply.containerId,
        supplierId: supply.supplierId,
        details: supply.details,
        fruitType: supply.fruitType,
        quantity: supply.quantity.toString(),
        price: supply.price.toString(),
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        containerId: initialContainerId || '',
        supplierId: '',
        details: '',
        fruitType: '',
        quantity: '',
        price: '',
      });
    }
  }, [supply, initialContainerId, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.containerId || !formData.supplierId || !formData.fruitType || !formData.quantity || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const container = containers.find((c) => c.id === formData.containerId);
    const supplier = suppliers.find((s) => s.id === formData.supplierId);

    if (!container || !supplier) {
      toast.error('Invalid container or supplier selected');
      return;
    }

    const supplyData = {
      date: new Date(formData.date).toISOString(),
      containerId: formData.containerId,
      containerNumber: container.containerNumber,
      supplierId: formData.supplierId,
      supplierName: supplier.name,
      details: formData.details,
      fruitType: formData.fruitType,
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
    };

    if (supply) {
      updateSupply(supply.id, supplyData);
      toast.success('Supply updated successfully');
    } else {
      addSupply(supplyData);
      toast.success('Supply registered successfully');
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{supply ? 'Edit Supply' : 'Register New Supply'}</DialogTitle>
          <DialogDescription>
            {supply
              ? 'Update supply information below. Changes will automatically update the corresponding supplier transaction.'
              : 'Register a new supply with container, supplier, and fruit details. A new transaction will be created for the supplier automatically.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date of Supply *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="containerId">Container Number *</Label>
              <Select
                value={formData.containerId || 'none'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, containerId: value === 'none' ? '' : value }))
                }
                disabled={!!initialContainerId && !supply}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a container" />
                </SelectTrigger>
                <SelectContent>
                  {!initialContainerId && !supply && (
                    <SelectItem value="none">Select a container</SelectItem>
                  )}
                  {containers.map((container) => (
                    <SelectItem key={container.id} value={container.id}>
                      {container.containerNumber} ({container.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {initialContainerId && !supply && (
                <p className="text-xs text-muted-foreground">
                  Container is pre-selected. This supply will be added to this container.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierId">Supplier Name *</Label>
            <Select
              value={formData.supplierId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, supplierId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details / Notes</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, details: e.target.value }))
              }
              placeholder="Enter any additional notes or details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fruitType">Fruit Type *</Label>
              <Select
                value={formData.fruitType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, fruitType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fruit type" />
                </SelectTrigger>
                <SelectContent>
                  {fruitTypesList.map((fruit) => (
                    <SelectItem key={fruit} value={fruit}>
                      {fruit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price per Unit *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Auto-calculated total */}
          {totalAmount > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Amount (Auto-calculated):
                </span>
                <span className="text-xl font-bold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formData.quantity} × {formatCurrency(parseFloat(formData.price) || 0)} = {formatCurrency(totalAmount)}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{supply ? 'Update' : 'Register'} Supply</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


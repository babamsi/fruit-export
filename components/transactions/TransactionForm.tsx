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
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { useSupplierStore } from '@/lib/stores/supplierStore';
import { useContainerStore } from '@/lib/stores/containerStore';
import type { Transaction } from '@/lib/types';
import { toast } from 'sonner';

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

interface TransactionFormProps {
  transaction?: Transaction;
  supplierId?: string; // Pre-fill supplier when opened from supplier list
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionForm({ transaction, supplierId: initialSupplierId, open, onOpenChange }: TransactionFormProps) {
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const updateTransaction = useTransactionStore((state) => state.updateTransaction);
  const suppliers = useSupplierStore((state) => state.suppliers);
  const containers = useContainerStore((state) => state.containers);

  const [formData, setFormData] = useState({
    supplierId: '',
    fruitType: '',
    quantity: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    containerId: '',
  });

  useEffect(() => {
    if (transaction) {
      const supplier = suppliers.find((s) => s.id === transaction.supplierId);
      setFormData({
        supplierId: transaction.supplierId,
        fruitType: transaction.fruitType,
        quantity: transaction.quantity.toString(),
        amount: transaction.amount.toString(),
        date: transaction.date.split('T')[0],
        containerId: transaction.containerId || '',
      });
    } else {
      setFormData({
        supplierId: initialSupplierId || '',
        fruitType: '',
        quantity: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        containerId: '',
      });
    }
  }, [transaction, initialSupplierId, open, suppliers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId || !formData.fruitType || !formData.quantity || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const supplier = suppliers.find((s) => s.id === formData.supplierId);
    if (!supplier) {
      toast.error('Invalid supplier selected');
      return;
    }

    const transactionData = {
      supplierId: formData.supplierId,
      supplierName: supplier.name,
      fruitType: formData.fruitType,
      quantity: parseInt(formData.quantity),
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
      containerId: formData.containerId || undefined,
      status: 'Pending' as const,
    };

    if (transaction) {
      updateTransaction(transaction.id, transactionData);
      toast.success('Transaction updated successfully');
    } else {
      addTransaction(transactionData);
      toast.success('Transaction added successfully');
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {transaction
              ? 'Edit Transaction'
              : initialSupplierId
              ? `Add Fruit Transaction - ${suppliers.find((s) => s.id === initialSupplierId)?.name || 'Supplier'}`
              : 'Add New Transaction'}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? 'Update transaction information below.'
              : initialSupplierId
              ? 'Add fruits delivered by this supplier with price and quantity.'
              : 'Add a new transaction to your system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplierId">Supplier *</Label>
            <Select
              value={formData.supplierId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, supplierId: value }))
              }
              disabled={!!initialSupplierId}
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
            {initialSupplierId && (
              <p className="text-xs text-muted-foreground">
                Supplier is pre-selected. To change, use the general transaction form.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="containerId">Container (Optional)</Label>
            <Select
              value={formData.containerId || 'none'}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, containerId: value === 'none' ? '' : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a container (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {containers.map((container) => (
                  <SelectItem key={container.id} value={container.id}>
                    {container.containerNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{transaction ? 'Update' : 'Add'} Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


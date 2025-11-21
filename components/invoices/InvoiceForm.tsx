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
import { useInvoiceStore } from '@/lib/stores/invoiceStore';
import { useSupplierStore } from '@/lib/stores/supplierStore';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { allocatePayment, previewAllocation } from '@/lib/utils/fifo';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';

interface InvoiceFormProps {
  supplierId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceForm({ supplierId: initialSupplierId, open, onOpenChange }: InvoiceFormProps) {
  const addInvoice = useInvoiceStore((state) => state.addInvoice);
  const suppliers = useSupplierStore((state) => state.suppliers);
  const getTransactionsBySupplier = useTransactionStore((state) => state.getTransactionsBySupplier);

  const [formData, setFormData] = useState({
    supplierId: initialSupplierId || '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
  });

  const [preview, setPreview] = useState<ReturnType<typeof previewAllocation> | null>(null);

  useEffect(() => {
    if (initialSupplierId) {
      setFormData((prev) => ({ ...prev, supplierId: initialSupplierId }));
    }
  }, [initialSupplierId]);

  useEffect(() => {
    if (formData.supplierId && formData.amount) {
      const transactions = getTransactionsBySupplier(formData.supplierId);
      const paymentAmount = parseFloat(formData.amount) || 0;
      if (paymentAmount > 0) {
        const previewResult = previewAllocation(transactions, paymentAmount);
        setPreview(previewResult);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [formData.supplierId, formData.amount, getTransactionsBySupplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const supplier = suppliers.find((s) => s.id === formData.supplierId);
    if (!supplier) {
      toast.error('Invalid supplier selected');
      return;
    }

    const transactions = getTransactionsBySupplier(formData.supplierId);
    const paymentAmount = parseFloat(formData.amount);

    if (paymentAmount <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }

    const allocation = allocatePayment(transactions, paymentAmount);

    if (allocation.clearedTransactions.length === 0) {
      toast.error('No transactions to clear. Please check supplier transactions.');
      return;
    }

    const invoiceData = {
      supplierId: formData.supplierId,
      supplierName: supplier.name,
      amount: paymentAmount,
      date: new Date(formData.date).toISOString(),
      transactionsCleared: allocation.clearedTransactions,
      paymentMethod: formData.paymentMethod,
    };

    addInvoice(invoiceData);
    toast.success('Invoice created successfully');
    onOpenChange(false);

    // Reset form
    setFormData({
      supplierId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
    });
    setPreview(null);
  };

  const selectedSupplier = suppliers.find((s) => s.id === formData.supplierId);
  const transactions = formData.supplierId
    ? getTransactionsBySupplier(formData.supplierId)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Create Payment Invoice</DialogTitle>
          <DialogDescription>
            Create a payment invoice and automatically allocate payment using FIFO method.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierId">Supplier *</Label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, supplierId: value }))
                }
              >
                <SelectTrigger className="w-full" id="supplier-select">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent 
                  className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
                  position="popper"
                >
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      <span className="truncate block max-w-full">
                        {supplier.name} (Balance: {formatCurrency(supplier.balance)})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent 
                  className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
                  position="popper"
                >
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (USD) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Payment Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full"
                required
              />
            </div>
          </div>

          {selectedSupplier && (
            <Card>
              <CardHeader>
                <CardTitle>Supplier Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Owed</div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(selectedSupplier.totalOwed)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Paid</div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(selectedSupplier.totalPaid)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Outstanding Balance</div>
                    <div className="text-lg font-semibold text-red-600">
                      {formatCurrency(selectedSupplier.balance)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {preview && preview.clearedTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Preview (FIFO Allocation)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {preview.clearedTransactions.map((cleared, index) => {
                    const transaction = transactions.find(
                      (t) => t.id === cleared.transactionId
                    );
                    if (!transaction) return null;

                    return (
                      <div
                        key={cleared.transactionId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {formatDate(transaction.date)} - {transaction.fruitType}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Original: {formatCurrency(transaction.amount)} | Cleared:{' '}
                            {formatCurrency(cleared.amountCleared)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Remaining</div>
                          <div
                            className={
                              cleared.remainingBalance === 0
                                ? 'text-green-600 font-medium'
                                : 'text-yellow-600 font-medium'
                            }
                          >
                            {formatCurrency(cleared.remainingBalance)}
                          </div>
                          <StatusBadge
                            status={
                              cleared.remainingBalance === 0
                                ? 'Fully Paid'
                                : 'Partially Paid'
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    );
                  })}
                  {preview.remainingPayment > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-sm text-yellow-800">
                        Warning: ${formatCurrency(preview.remainingPayment)} payment will not
                        be allocated (exceeds outstanding transactions)
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!preview || preview.clearedTransactions.length === 0}>
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}




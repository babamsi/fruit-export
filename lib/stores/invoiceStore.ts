import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Invoice } from '@/lib/types';
import { useSupplierStore } from './supplierStore';
import { useTransactionStore } from './transactionStore';
import { useExpenseStore } from './expenseStore';

interface InvoiceStore {
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  getInvoice: (id: string) => Invoice | undefined;
  getInvoicesBySupplier: (supplierId: string) => Invoice[];
  initializeInvoices: (invoices: Invoice[]) => void;
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      invoices: [],

      addInvoice: (invoiceData) => {
        const newInvoice: Invoice = {
          ...invoiceData,
          id: crypto.randomUUID(),
        };

        set((state) => ({
          invoices: [...state.invoices, newInvoice],
        }));

        // Update transaction statuses based on cleared transactions
        const transactionStore = useTransactionStore.getState();
        invoiceData.transactionsCleared.forEach((cleared) => {
          transactionStore.updateTransactionStatus(
            cleared.transactionId,
            cleared.remainingBalance === 0 ? 'Fully Paid' : 'Partially Paid',
            cleared.remainingBalance
          );
        });

        // Update supplier totals
        const supplier = useSupplierStore.getState().getSupplier(invoiceData.supplierId);
        if (supplier) {
          const newTotalPaid = supplier.totalPaid + invoiceData.amount;
          useSupplierStore.getState().updateSupplierTotals(
            supplier.id,
            supplier.totalOwed,
            newTotalPaid
          );
        }

        // Auto-create expense entry
        useExpenseStore.getState().addExpense({
          category: 'Supplier Payment',
          description: `Payment to ${invoiceData.supplierName}`,
          amount: invoiceData.amount,
          date: invoiceData.date,
          supplierId: invoiceData.supplierId,
          invoiceId: newInvoice.id,
        });
      },

      getInvoice: (id) => {
        return get().invoices.find((invoice) => invoice.id === id);
      },

      getInvoicesBySupplier: (supplierId) => {
        return get().invoices.filter(
          (invoice) => invoice.supplierId === supplierId
        );
      },

      initializeInvoices: (invoices) => {
        set({ invoices });
      },
    }),
    {
      name: 'fruit-export-invoices',
    }
  )
);




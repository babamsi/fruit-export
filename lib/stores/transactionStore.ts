import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction } from '@/lib/types';
import { useSupplierStore } from './supplierStore';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'remainingBalance'>, transactionId?: string) => string; // Returns transaction ID
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransaction: (id: string) => Transaction | undefined;
  getTransactionsBySupplier: (supplierId: string) => Transaction[];
  getTransactionsByContainer: (containerId: string) => Transaction[];
  updateTransactionStatus: (id: string, status: Transaction['status'], remainingBalance: number) => void;
  initializeTransactions: (transactions: Transaction[]) => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (transactionData, transactionId?: string) => {
        const id = transactionId || crypto.randomUUID();
        const newTransaction: Transaction = {
          ...transactionData,
          id,
          remainingBalance: transactionData.amount,
        };

        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));

        // Update supplier totals
        const supplier = useSupplierStore.getState().getSupplier(transactionData.supplierId);
        if (supplier) {
          const transactions = get().getTransactionsBySupplier(supplier.id);
          const currentTotalOwed = transactions.reduce((sum, t) => sum + t.amount, 0);
          
          useSupplierStore.getState().updateSupplierTotals(
            supplier.id,
            currentTotalOwed,
            supplier.totalPaid
          );
        }

        return id; // Return the transaction ID
      },

      updateTransaction: (id, updates) => {
        const oldTransaction = get().getTransaction(id);
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? { ...transaction, ...updates }
              : transaction
          ),
        }));

        // Update supplier totals if amount changed
        if (updates.amount && oldTransaction) {
          const supplier = useSupplierStore.getState().getSupplier(oldTransaction.supplierId);
          if (supplier) {
            const transactions = get().getTransactionsBySupplier(supplier.id);
            const totalOwed = transactions.reduce((sum, t) => 
              sum + (t.id === id ? updates.amount! : t.amount), 0
            );
            useSupplierStore.getState().updateSupplierTotals(
              supplier.id,
              totalOwed,
              supplier.totalPaid
            );
          }
        }
      },

      deleteTransaction: (id) => {
        const transaction = get().getTransaction(id);
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));

        // Update supplier totals
        if (transaction) {
          const supplier = useSupplierStore.getState().getSupplier(transaction.supplierId);
          if (supplier) {
            const transactions = get().getTransactionsBySupplier(supplier.id);
            const totalOwed = transactions.reduce((sum, t) => sum + t.amount, 0);
            useSupplierStore.getState().updateSupplierTotals(
              supplier.id,
              totalOwed,
              supplier.totalPaid
            );
          }
        }
      },

      getTransaction: (id) => {
        return get().transactions.find((transaction) => transaction.id === id);
      },

      getTransactionsBySupplier: (supplierId) => {
        return get().transactions.filter(
          (transaction) => transaction.supplierId === supplierId
        );
      },

      getTransactionsByContainer: (containerId) => {
        return get().transactions.filter(
          (transaction) => transaction.containerId === containerId
        );
      },

      updateTransactionStatus: (id, status, remainingBalance) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id
              ? { ...transaction, status, remainingBalance }
              : transaction
          ),
        }));
      },

      initializeTransactions: (transactions) => {
        set({ transactions });
      },
    }),
    {
      name: 'fruit-export-transactions',
    }
  )
);


import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Expense } from '@/lib/types';

interface ExpenseStore {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpense: (id: string) => Expense | undefined;
  getExpensesBySupplier: (supplierId: string) => Expense[];
  getExpensesByCategory: (category: Expense['category']) => Expense[];
  initializeExpenses: (expenses: Expense[]) => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],

      addExpense: (expenseData) => {
        const newExpense: Expense = {
          ...expenseData,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }));
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, ...updates } : expense
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },

      getExpense: (id) => {
        return get().expenses.find((expense) => expense.id === id);
      },

      getExpensesBySupplier: (supplierId) => {
        return get().expenses.filter(
          (expense) => expense.supplierId === supplierId
        );
      },

      getExpensesByCategory: (category) => {
        return get().expenses.filter((expense) => expense.category === category);
      },

      initializeExpenses: (expenses) => {
        set({ expenses });
      },
    }),
    {
      name: 'fruit-export-expenses',
    }
  )
);




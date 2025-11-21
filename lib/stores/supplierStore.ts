import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Supplier } from '@/lib/types';
import { calculateSupplierBalance } from '@/lib/utils/calculations';

interface SupplierStore {
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalOwed' | 'totalPaid' | 'balance'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  getSupplier: (id: string) => Supplier | undefined;
  updateSupplierTotals: (supplierId: string, totalOwed: number, totalPaid: number) => void;
  recalculateSupplierBalance: (supplierId: string) => void;
  initializeSuppliers: (suppliers: Supplier[]) => void;
}

export const useSupplierStore = create<SupplierStore>()(
  persist(
    (set, get) => ({
      suppliers: [],

      addSupplier: (supplierData) => {
        const newSupplier: Supplier = {
          ...supplierData,
          id: crypto.randomUUID(),
          totalOwed: 0,
          totalPaid: 0,
          balance: 0,
        };
        set((state) => ({
          suppliers: [...state.suppliers, newSupplier],
        }));
      },

      updateSupplier: (id, updates) => {
        set((state) => ({
          suppliers: state.suppliers.map((supplier) =>
            supplier.id === id
              ? { ...supplier, ...updates }
              : supplier
          ),
        }));
        // Recalculate balance after update
        get().recalculateSupplierBalance(id);
      },

      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter((supplier) => supplier.id !== id),
        }));
      },

      getSupplier: (id) => {
        return get().suppliers.find((supplier) => supplier.id === id);
      },

      updateSupplierTotals: (supplierId, totalOwed, totalPaid) => {
        set((state) => ({
          suppliers: state.suppliers.map((supplier) =>
            supplier.id === supplierId
              ? {
                  ...supplier,
                  totalOwed,
                  totalPaid,
                  balance: calculateSupplierBalance({
                    ...supplier,
                    totalOwed,
                    totalPaid,
                  }),
                }
              : supplier
          ),
        }));
      },

      recalculateSupplierBalance: (supplierId) => {
        const supplier = get().getSupplier(supplierId);
        if (supplier) {
          const balance = calculateSupplierBalance(supplier);
          set((state) => ({
            suppliers: state.suppliers.map((s) =>
              s.id === supplierId ? { ...s, balance } : s
            ),
          }));
        }
      },

      initializeSuppliers: (suppliers) => {
        set({ suppliers });
      },
    }),
    {
      name: 'fruit-export-suppliers',
      skipHydration: false,
    }
  )
);




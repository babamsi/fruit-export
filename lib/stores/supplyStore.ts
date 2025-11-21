import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Supply, ContainerSupplier } from '@/lib/types';
import { useTransactionStore } from './transactionStore';
import { useSupplierStore } from './supplierStore';
import { useContainerStore } from './containerStore';

interface SupplyStore {
  supplies: Supply[];
  addSupply: (supply: Omit<Supply, 'id' | 'totalAmount'>, createTransaction?: boolean) => void;
  updateSupply: (id: string, updates: Partial<Supply>) => void;
  deleteSupply: (id: string) => void;
  getSupply: (id: string) => Supply | undefined;
  getSuppliesByContainer: (containerId: string) => Supply[];
  getSuppliesBySupplier: (supplierId: string) => Supply[];
  initializeSupplies: (supplies: Supply[]) => void;
}

export const useSupplyStore = create<SupplyStore>()(
  persist(
    (set, get) => ({
      supplies: [],

      addSupply: (supplyData, createTransaction = true) => {
        const totalAmount = supplyData.quantity * supplyData.price;
        const supplyId = crypto.randomUUID();
        
        let transactionId: string | undefined;

        // Create corresponding transaction for the supplier
        if (createTransaction) {
          transactionId = useTransactionStore.getState().addTransaction({
            supplierId: supplyData.supplierId,
            supplierName: supplyData.supplierName,
            fruitType: supplyData.fruitType,
            quantity: supplyData.quantity,
            amount: totalAmount,
            date: supplyData.date,
            containerId: supplyData.containerId,
            status: 'Pending',
          });
          // Note: The transaction store already updates supplier totals
        }

        // Add supplier entry to the container
        const containerStore = useContainerStore.getState();
        const container = containerStore.getContainer(supplyData.containerId);
        if (container) {
          const containerSupplier: ContainerSupplier = {
            supplierId: supplyData.supplierId,
            supplierName: supplyData.supplierName,
            fruitType: supplyData.fruitType,
            quantity: supplyData.quantity,
            transactionId: transactionId || crypto.randomUUID(),
            amount: totalAmount,
          };

          const updatedSuppliers = [...container.suppliers, containerSupplier];
          // Update container with new supplier entry (this will recalculate totalValue)
          containerStore.updateContainer(container.id, {
            suppliers: updatedSuppliers,
          });
        }

        const newSupply: Supply = {
          ...supplyData,
          id: supplyId,
          totalAmount,
          transactionId,
        };
        set((state) => ({
          supplies: [...state.supplies, newSupply],
        }));
      },

      updateSupply: (id, updates) => {
        const existingSupply = get().getSupply(id);
        if (!existingSupply) return;

        // Calculate updated values
        const updatedQuantity = updates.quantity !== undefined ? updates.quantity : existingSupply.quantity;
        const updatedPrice = updates.price !== undefined ? updates.price : existingSupply.price;
        const updatedTotalAmount = updatedQuantity * updatedPrice;

        // Calculate what the updated supply will be
        const updatedSupply: Supply = {
          ...existingSupply,
          ...updates,
          totalAmount: updatedTotalAmount,
        };

        set((state) => ({
          supplies: state.supplies.map((supply) => {
            if (supply.id === id) {
              return updatedSupply;
            }
            return supply;
          }),
        }));

        // Update corresponding transaction if it exists
        if (existingSupply.transactionId) {
          const existingTransaction = useTransactionStore.getState().getTransaction(existingSupply.transactionId);
          if (existingTransaction) {
            // Calculate new remaining balance
            const amountDiff = updatedSupply.totalAmount - existingSupply.totalAmount;
            let newRemainingBalance = existingTransaction.remainingBalance + amountDiff;
            
            // Ensure remaining balance doesn't exceed total amount or go negative
            newRemainingBalance = Math.max(0, Math.min(updatedSupply.totalAmount, newRemainingBalance));

            useTransactionStore.getState().updateTransaction(existingSupply.transactionId, {
              fruitType: updatedSupply.fruitType,
              quantity: updatedSupply.quantity,
              amount: updatedSupply.totalAmount,
              date: updatedSupply.date,
              containerId: updatedSupply.containerId,
              remainingBalance: newRemainingBalance,
              // Update status if fully paid
              status: newRemainingBalance === 0 ? 'Fully Paid' : 
                      newRemainingBalance < updatedSupply.totalAmount ? 'Partially Paid' : 'Pending',
            });
          }
        }

        // Update container supplier entry
        const containerStore = useContainerStore.getState();
        const oldContainer = containerStore.getContainer(existingSupply.containerId);
        
        // Handle container change if containerId was updated
        if (updates.containerId && updates.containerId !== existingSupply.containerId) {
          // Remove from old container
          if (oldContainer && existingSupply.transactionId) {
            const updatedOldSuppliers = oldContainer.suppliers.filter(
              (cs) => cs.transactionId !== existingSupply.transactionId
            );
            containerStore.updateContainer(oldContainer.id, {
              suppliers: updatedOldSuppliers,
            });
          }

          // Add to new container
          const newContainer = containerStore.getContainer(updates.containerId);
          if (newContainer) {
            const containerSupplier: ContainerSupplier = {
              supplierId: updatedSupply.supplierId,
              supplierName: updatedSupply.supplierName,
              fruitType: updatedSupply.fruitType,
              quantity: updatedSupply.quantity,
              transactionId: existingSupply.transactionId || crypto.randomUUID(),
              amount: updatedSupply.totalAmount,
            };
            const updatedNewSuppliers = [...newContainer.suppliers, containerSupplier];
            containerStore.updateContainer(newContainer.id, {
              suppliers: updatedNewSuppliers,
            });
          }
        } else if (oldContainer && existingSupply.transactionId) {
          // Update in same container
          const updatedSuppliers = oldContainer.suppliers.map((cs) => {
            if (cs.transactionId === existingSupply.transactionId) {
              return {
                ...cs,
                supplierId: updatedSupply.supplierId,
                supplierName: updatedSupply.supplierName,
                fruitType: updatedSupply.fruitType,
                quantity: updatedSupply.quantity,
                amount: updatedSupply.totalAmount,
              };
            }
            return cs;
          });

          containerStore.updateContainer(oldContainer.id, {
            suppliers: updatedSuppliers,
          });
        }
      },

      deleteSupply: (id) => {
        const supply = get().getSupply(id);
        if (!supply) return;

        // Remove supplier entry from container
        const containerStore = useContainerStore.getState();
        const container = containerStore.getContainer(supply.containerId);
        if (container && supply.transactionId) {
          const updatedSuppliers = container.suppliers.filter(
            (cs) => cs.transactionId !== supply.transactionId
          );
          containerStore.updateContainer(container.id, {
            suppliers: updatedSuppliers,
          });
        }

        // Delete corresponding transaction if it exists
        if (supply.transactionId) {
          useTransactionStore.getState().deleteTransaction(supply.transactionId);
        }

        set((state) => ({
          supplies: state.supplies.filter((supply) => supply.id !== id),
        }));
      },

      getSupply: (id) => {
        return get().supplies.find((supply) => supply.id === id);
      },

      getSuppliesByContainer: (containerId) => {
        return get().supplies.filter((supply) => supply.containerId === containerId);
      },

      getSuppliesBySupplier: (supplierId) => {
        return get().supplies.filter((supply) => supply.supplierId === supplierId);
      },

      initializeSupplies: (supplies) => {
        set({ supplies });
      },
    }),
    {
      name: 'fruit-export-supplies',
    }
  )
);


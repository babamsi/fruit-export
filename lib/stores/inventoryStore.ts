import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PackagingItem } from '@/lib/types';

interface InventoryStore {
  items: PackagingItem[];
  addItem: (item: Omit<PackagingItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<PackagingItem>) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => PackagingItem | undefined;
  restockItem: (id: string, quantity: number) => void;
  initializeItems: (items: PackagingItem[]) => void;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (itemData) => {
        const newItem: PackagingItem = {
          ...itemData,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      getItem: (id) => {
        return get().items.find((item) => item.id === id);
      },

      restockItem: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  lastRestocked: new Date().toISOString(),
                }
              : item
          ),
        }));
      },

      initializeItems: (items) => {
        set({ items });
      },
    }),
    {
      name: 'fruit-export-inventory',
    }
  )
);




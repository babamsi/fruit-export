import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Container } from '@/lib/types';
import { calculateContainerValue } from '@/lib/utils/calculations';

interface ContainerStore {
  containers: Container[];
  addContainer: (container: Omit<Container, 'id' | 'totalValue'>) => void;
  updateContainer: (id: string, updates: Partial<Container>) => void;
  deleteContainer: (id: string) => void;
  getContainer: (id: string) => Container | undefined;
  recalculateContainerValue: (id: string) => void;
  initializeContainers: (containers: Container[]) => void;
}

export const useContainerStore = create<ContainerStore>()(
  persist(
    (set, get) => ({
      containers: [],

      addContainer: (containerData) => {
        const newContainer: Container = {
          ...containerData,
          id: crypto.randomUUID(),
          totalValue: calculateContainerValue(containerData as Container),
        };
        set((state) => ({
          containers: [...state.containers, newContainer],
        }));
        get().recalculateContainerValue(newContainer.id);
      },

      updateContainer: (id, updates) => {
        set((state) => ({
          containers: state.containers.map((container) =>
            container.id === id
              ? { ...container, ...updates }
              : container
          ),
        }));
        get().recalculateContainerValue(id);
      },

      deleteContainer: (id) => {
        set((state) => ({
          containers: state.containers.filter((container) => container.id !== id),
        }));
      },

      getContainer: (id) => {
        return get().containers.find((container) => container.id === id);
      },

      recalculateContainerValue: (id) => {
        const container = get().getContainer(id);
        if (container) {
          const totalValue = calculateContainerValue(container);
          set((state) => ({
            containers: state.containers.map((c) =>
              c.id === id ? { ...c, totalValue } : c
            ),
          }));
        }
      },

      initializeContainers: (containers) => {
        set({ containers });
      },
    }),
    {
      name: 'fruit-export-containers',
    }
  )
);




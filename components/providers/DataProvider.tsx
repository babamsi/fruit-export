'use client';

import { useEffect } from 'react';
import { initializeMockData } from '@/lib/data/mockData';

export function DataProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize mock data on client-side only
    if (typeof window !== 'undefined') {
      initializeMockData();
    }
  }, []);

  return <>{children}</>;
}




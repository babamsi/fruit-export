'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  onClear?: () => void;
  showClear?: boolean;
}

export function FilterBar({ children, onClear, showClear = true }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {children}
      {showClear && onClear && (
        <Button variant="outline" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}




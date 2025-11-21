'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryStore } from '@/lib/stores/inventoryStore';
import { getLowStockItems } from '@/lib/utils/calculations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import type { PackagingItem } from '@/lib/types';

export function LowStockAlerts() {
  const inventoryItems = useInventoryStore((state) => state.items);
  const lowStockItems = getLowStockItems(inventoryItems);

  const columns = [
    {
      key: 'name',
      header: 'Item',
      cell: (row: PackagingItem) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-muted-foreground">{row.category}</div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Current Quantity',
      cell: (row: PackagingItem) => (
        <div className="text-red-600 font-medium">
          {row.quantity} {row.unit}
        </div>
      ),
    },
    {
      key: 'minQuantity',
      header: 'Min Quantity',
      cell: (row: PackagingItem) => `${row.minQuantity} ${row.unit}`,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: PackagingItem) => <StatusBadge status="low-stock" />,
    },
  ];

  if (lowStockItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>All items are above minimum quantity!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Low Stock Alerts ({lowStockItems.length})
          </CardTitle>
          <Link href="/inventory">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={lowStockItems}
          columns={columns}
          emptyMessage="No low stock items."
        />
      </CardContent>
    </Card>
  );
}




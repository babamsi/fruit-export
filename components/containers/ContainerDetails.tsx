'use client';

import { useState, useEffect } from 'react';
import { useContainerStore } from '@/lib/stores/containerStore';
import { useSupplyStore } from '@/lib/stores/supplyStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Calendar, DollarSign, Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/shared/DataTable';
import Link from 'next/link';

interface ContainerDetailsProps {
  containerId: string;
}

export function ContainerDetails({ containerId }: ContainerDetailsProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allContainers = useContainerStore((state) => state.containers);
  const container = isMounted ? allContainers.find((c) => c.id === containerId) : undefined;

  const allSupplies = useSupplyStore((state) => state.supplies);
  const containerSupplies = isMounted
    ? allSupplies.filter((s) => s.containerId === containerId)
    : [];

  if (!isMounted) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!container) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Container not found</p>
        <Button onClick={() => router.push('/containers')} className="mt-4">
          Back to Containers
        </Button>
      </div>
    );
  }

  const supplierColumns = [
    {
      key: 'supplierName',
      header: 'Supplier',
      cell: (row: typeof container.suppliers[0]) => row.supplierName,
    },
    {
      key: 'fruitType',
      header: 'Fruit Type',
      cell: (row: typeof container.suppliers[0]) => row.fruitType,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      cell: (row: typeof container.suppliers[0]) => row.quantity.toLocaleString(),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (row: typeof container.suppliers[0]) => formatCurrency(row.amount),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/containers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{container.containerNumber}</h1>
          <StatusBadge status={container.status} className="mt-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Value"
          value={container.totalValue}
          icon={DollarSign}
          formatAsCurrency
        />
        <StatCard
          title="Suppliers"
          value={container.suppliers.length}
          icon={Package}
        />
        {container.shipDate && (
          <StatCard
            title="Ship Date"
            value={formatDate(container.shipDate)}
            icon={Calendar}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Container Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="mt-1">
                <StatusBadge status={container.status} />
              </p>
            </div>
            {container.shipDate && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ship Date</label>
                <p className="mt-1">{formatDate(container.shipDate)}</p>
              </div>
            )}
            {container.deliveryDate && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Delivery Date</label>
                <p className="mt-1">{formatDate(container.deliveryDate)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {container.consignee && (
        <Card>
          <CardHeader>
            <CardTitle>Consignee Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {container.consignee.name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="mt-1 font-medium">{container.consignee.name}</p>
                </div>
              )}
              {container.consignee.company && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p className="mt-1 font-medium">{container.consignee.company}</p>
                </div>
              )}
              {container.consignee.location && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Location/Address</label>
                  <p className="mt-1">{container.consignee.location}</p>
                </div>
              )}
              {container.consignee.city && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <p className="mt-1">{container.consignee.city}</p>
                </div>
              )}
              {container.consignee.country && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Country</label>
                  <p className="mt-1">{container.consignee.country}</p>
                </div>
              )}
              {container.consignee.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="mt-1">
                    <a href={`mailto:${container.consignee.email}`} className="text-primary hover:underline">
                      {container.consignee.email}
                    </a>
                  </p>
                </div>
              )}
              {container.consignee.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="mt-1">
                    <a href={`tel:${container.consignee.phone}`} className="text-primary hover:underline">
                      {container.consignee.phone}
                    </a>
                  </p>
                </div>
              )}
              {container.consignee.additionalInfo && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Additional Information</label>
                  <p className="mt-1 whitespace-pre-wrap">{container.consignee.additionalInfo}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Supplier Contributions</CardTitle>
            <Link href={`/supply?container=${containerId}`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Supply
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {container.suppliers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No suppliers added to this container yet.
              </p>
              <Link href={`/supply?container=${containerId}`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Supply
                </Button>
              </Link>
            </div>
          ) : (
            <DataTable
              data={container.suppliers}
              columns={supplierColumns}
              emptyMessage="No suppliers added to this container."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}



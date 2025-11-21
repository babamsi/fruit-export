'use client';

import { useState } from 'react';
import { useContainerStore } from '@/lib/stores/containerStore';
import { DataTable } from '@/components/shared/DataTable';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterBar } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ContainerForm } from './ContainerForm';
import type { Container } from '@/lib/types';

export function ContainerList() {
  const containers = useContainerStore((state) => state.containers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<Container | undefined>();

  const filteredContainers = containers.filter((container) => {
    const matchesSearch = container.containerNumber
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || container.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
  };

  const columns = [
    {
      key: 'containerNumber',
      header: 'Container Number',
      cell: (row: Container) => (
        <div>
          <div className="font-medium">{row.containerNumber}</div>
          <div className="text-sm text-muted-foreground">
            {row.suppliers.length} supplier{row.suppliers.length !== 1 ? 's' : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: Container) => <StatusBadge status={row.status} />,
    },
    {
      key: 'suppliers',
      header: 'Suppliers',
      cell: (row: Container) => (
        <div className="flex flex-wrap gap-1">
          {row.suppliers.slice(0, 2).map((s, i) => (
            <span key={i} className="text-xs bg-secondary px-2 py-1 rounded">
              {s.supplierName}
            </span>
          ))}
          {row.suppliers.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{row.suppliers.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'totalValue',
      header: 'Total Value',
      cell: (row: Container) => formatCurrency(row.totalValue),
    },
    {
      key: 'dates',
      header: 'Dates',
      cell: (row: Container) => (
        <div className="text-sm">
          {row.shipDate && (
            <div>Ship: {formatDate(row.shipDate)}</div>
          )}
          {row.deliveryDate && (
            <div>Delivery: {formatDate(row.deliveryDate)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: Container) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedContainer(row);
            setIsFormOpen(true);
          }}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Containers</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Container
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <SearchBar placeholder="Search containers..." onSearch={setSearchQuery} />
        <FilterBar onClear={handleClearFilters}>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Preparing">Preparing</SelectItem>
              <SelectItem value="In Transit">In Transit</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>
      </div>

      <DataTable
        data={filteredContainers}
        columns={columns}
        onRowClick={(container) => {
          setSelectedContainer(container);
          setIsFormOpen(true);
        }}
        emptyMessage="No containers found. Add your first container to get started."
      />

      <ContainerForm
        container={selectedContainer}
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setSelectedContainer(undefined);
          }
        }}
      />
    </div>
  );
}



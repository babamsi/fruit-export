'use client';

import { useState } from 'react';
import { useInvoiceStore } from '@/lib/stores/invoiceStore';
import { DataTable } from '@/components/shared/DataTable';
import { SearchBar } from '@/components/shared/SearchBar';
import { Button } from '@/components/ui/button';
import { Plus, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { InvoiceForm } from './InvoiceForm';
import { InvoicePrint } from './InvoicePrint';
import type { Invoice } from '@/lib/types';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

export function InvoiceList() {
  const invoices = useInvoiceStore((state) => state.invoices);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [printInvoiceId, setPrintInvoiceId] = useState<string | null>(null);

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'date',
      header: 'Date',
      cell: (row: Invoice) => formatDate(row.date),
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      cell: (row: Invoice) => row.supplierName,
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (row: Invoice) => formatCurrency(row.amount),
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      cell: (row: Invoice) => row.paymentMethod,
    },
    {
      key: 'transactionsCleared',
      header: 'Transactions Cleared',
      cell: (row: Invoice) => row.transactionsCleared.length,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: Invoice) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setPrintInvoiceId(row.id);
          }}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <SearchBar placeholder="Search invoices..." onSearch={setSearchQuery} />

      <DataTable
        data={filteredInvoices}
        columns={columns}
        emptyMessage="No invoices found. Create your first invoice to get started."
      />

      <InvoiceForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <Dialog open={!!printInvoiceId} onOpenChange={(open) => !open && setPrintInvoiceId(null)}>
        <DialogContent 
          className="max-w-[95vw] w-full sm:max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-y-auto p-0"
          showCloseButton={true}
        >
          {printInvoiceId && <InvoicePrint invoiceId={printInvoiceId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}




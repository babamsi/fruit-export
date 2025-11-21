'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { useState, Suspense } from 'react';

function CreateInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierId = searchParams.get('supplier');
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-4">
      <InvoiceForm
        supplierId={supplierId || undefined}
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            router.push('/invoices');
          }
        }}
      />
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateInvoiceContent />
    </Suspense>
  );
}


import { SupplierDetails } from '@/components/suppliers/SupplierDetails';
import { use } from 'react';

export default function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SupplierDetails supplierId={id} />;
}


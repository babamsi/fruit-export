'use client';

import { SupplyList } from '@/components/supplies/SupplyList';
import { Suspense } from 'react';

function SupplyPageContent() {
  return <SupplyList />;
}

export default function SupplyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SupplyPageContent />
    </Suspense>
  );
}


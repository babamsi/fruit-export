import { ContainerDetails } from '@/components/containers/ContainerDetails';
import { use } from 'react';

export default function ContainerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ContainerDetails containerId={id} />;
}




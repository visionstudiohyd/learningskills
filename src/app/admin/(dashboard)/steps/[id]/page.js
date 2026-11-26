import ResourceEditPage from '@/components/admin/ResourceEditPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Process Steps' };

export default async function Page({ params }) {
  const { id } = await params;
  return <ResourceEditPage resourceKey="steps" id={id} />;
}

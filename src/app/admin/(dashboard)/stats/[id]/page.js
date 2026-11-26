import ResourceEditPage from '@/components/admin/ResourceEditPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Statistics' };

export default async function Page({ params }) {
  const { id } = await params;
  return <ResourceEditPage resourceKey="stats" id={id} />;
}

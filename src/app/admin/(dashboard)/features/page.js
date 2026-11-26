import ResourceListPage from '@/components/admin/ResourceListPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Benefits' };

export default function Page({ searchParams }) {
  return <ResourceListPage resourceKey="features" searchParams={searchParams} />;
}

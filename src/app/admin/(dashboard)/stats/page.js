import ResourceListPage from '@/components/admin/ResourceListPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Statistics' };

export default function Page({ searchParams }) {
  return <ResourceListPage resourceKey="stats" searchParams={searchParams} />;
}

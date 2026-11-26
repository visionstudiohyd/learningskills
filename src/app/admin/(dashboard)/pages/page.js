import ResourceListPage from '@/components/admin/ResourceListPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pages' };

export default function Page({ searchParams }) {
  return <ResourceListPage resourceKey="pages" searchParams={searchParams} />;
}

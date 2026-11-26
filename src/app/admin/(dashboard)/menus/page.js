import ResourceListPage from '@/components/admin/ResourceListPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Navigation' };

export default function Page({ searchParams }) {
  return <ResourceListPage resourceKey="menus" searchParams={searchParams} />;
}

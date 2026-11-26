import ResourceListPage from '@/components/admin/ResourceListPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Process Steps' };

export default function Page({ searchParams }) {
  return <ResourceListPage resourceKey="steps" searchParams={searchParams} />;
}

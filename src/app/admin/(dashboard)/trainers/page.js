import ResourceListPage from '@/components/admin/ResourceListPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Trainers' };

export default function Page({ searchParams }) {
  return <ResourceListPage resourceKey="trainers" searchParams={searchParams} />;
}

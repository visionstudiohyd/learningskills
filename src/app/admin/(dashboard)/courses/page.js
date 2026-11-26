import ResourceListPage from '@/components/admin/ResourceListPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Courses' };

export default function Page({ searchParams }) {
  return <ResourceListPage resourceKey="courses" searchParams={searchParams} />;
}

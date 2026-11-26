import ResourceListPage from '@/components/admin/ResourceListPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hero Slides' };

export default function Page({ searchParams }) {
  return <ResourceListPage resourceKey="slides" searchParams={searchParams} />;
}

import ResourceListPage from '@/components/admin/ResourceListPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Testimonials' };

export default function Page({ searchParams }) {
  return <ResourceListPage resourceKey="testimonials" searchParams={searchParams} />;
}

import ResourceListPage from '@/components/admin/ResourceListPage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'FAQs' };

export default function Page({ searchParams }) {
  return <ResourceListPage resourceKey="faqs" searchParams={searchParams} />;
}

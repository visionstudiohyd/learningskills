import { notFound } from 'next/navigation';
import { getSettings } from '@/lib/settings';
import { getAllPageSlugs, getPageBySlug } from '@/lib/queries/content';
import { excerpt, formatDate } from '@/lib/utils';
import PageHero from '@/components/layout/PageHero';
import CtaSection from '@/components/home/CtaSection';

export const revalidate = 300;

/**
 * Catch-all renderer for admin-created CMS pages (Privacy Policy, Terms,
 * Refund Policy and anything else the admin adds).
 *
 * This route sits last in the (site) group, so the real routes — /courses,
 * /about, /contact, /faqs — always win over a page row with the same slug.
 */
export async function generateStaticParams() {
  const rows = await getAllPageSlugs();
  // Never shadow a real route, even if someone creates a page with that slug.
  const reserved = new Set(['courses', 'about', 'contact', 'faqs', 'admin', 'api']);
  return rows.filter((row) => !reserved.has(row.slug)).map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: 'Page not found' };

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || excerpt(page.content, 180),
    keywords: page.meta_keywords ? page.meta_keywords.split(',').map((k) => k.trim()) : undefined,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function CmsPage({ params }) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPageBySlug(slug), getSettings()]);
  if (!page) notFound();

  return (
    <>
      <PageHero
        title={page.title}
        text={page.subtitle}
        image={page.banner_image}
        crumbs={[{ label: page.title }]}
        size="compact"
      />

      <section className="section bg-white">
        <div className="shell">
          <article className="mx-auto max-w-3xl">
            {page.updated_at && (
              <p className="mb-8 border-b border-ink-200 pb-5 text-sm text-ink-500">
                Last updated {formatDate(page.updated_at)}
              </p>
            )}

            <div
              className="prose-cms"
              // Page bodies are authored by signed-in staff in the admin
              // rich-text editor, so markup is intentional here.
              dangerouslySetInnerHTML={{ __html: page.content || '' }}
            />
          </article>
        </div>
      </section>

      <CtaSection settings={settings} />
    </>
  );
}

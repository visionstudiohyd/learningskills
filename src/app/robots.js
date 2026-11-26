import { getSettingBool } from '@/lib/settings';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const revalidate = 3600;

/**
 * robots.txt. The admin can switch the whole site to noindex from Settings →
 * SEO, which is what you want while a new site is still being populated.
 */
export default async function robots() {
  const indexable = await getSettingBool('seo_robots_index', true);

  if (!indexable) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The dashboard and API surface have nothing for a crawler.
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

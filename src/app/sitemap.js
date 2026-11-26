import { getAllCourseSlugs } from '@/lib/queries/courses';
import { getAllPageSlugs } from '@/lib/queries/content';
import { getSettingBool } from '@/lib/settings';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const revalidate = 3600;

/**
 * Generated sitemap. Courses and CMS pages come straight from the database, so
 * publishing a new course puts it in the sitemap without a deploy.
 */
export default async function sitemap() {
  const indexable = await getSettingBool('seo_robots_index', true);
  if (!indexable) return [];

  const [courses, pages] = await Promise.all([getAllCourseSlugs(), getAllPageSlugs()]);

  const now = new Date();

  const staticRoutes = [
    { url: '/', changeFrequency: 'daily', priority: 1 },
    { url: '/courses', changeFrequency: 'daily', priority: 0.9 },
    { url: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { url: '/contact', changeFrequency: 'monthly', priority: 0.8 },
    { url: '/faqs', changeFrequency: 'monthly', priority: 0.6 },
  ].map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const courseRoutes = courses.map((course) => ({
    url: `${SITE_URL}/courses/${course.slug}`,
    lastModified: course.updated_at ? new Date(course.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const pageRoutes = pages.map((page) => ({
    url: `${SITE_URL}/${page.slug}`,
    lastModified: page.updated_at ? new Date(page.updated_at) : now,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  return [...staticRoutes, ...courseRoutes, ...pageRoutes];
}

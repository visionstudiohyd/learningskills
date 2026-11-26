import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { getSettings } from '@/lib/settings';
import { DELIVERY_MODES, LEVELS, SORT_LABELS, getCourses } from '@/lib/queries/courses';
import { getFeatures } from '@/lib/queries/content';
import PageHero from '@/components/layout/PageHero';
import CourseCatalogue from '@/components/courses/CourseCatalogue';
import FeaturesSection from '@/components/home/FeaturesSection';
import CtaSection from '@/components/home/CtaSection';

const PER_PAGE = 9;

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: settings.courses_page_title || 'Our Courses',
    description: settings.courses_page_text || settings.seo_description,
    alternates: { canonical: '/courses' },
  };
}

export default async function CoursesPage({ searchParams }) {
  const sp = (await searchParams) || {};

  // getAll-style params arrive as a string when single, array when repeated.
  const asArray = (value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);

  const filters = {
    search: typeof sp.search === 'string' ? sp.search : '',
    level: asArray(sp.level),
    mode: asArray(sp.mode),
    sort: typeof sp.sort === 'string' ? sp.sort : 'featured',
    page: Number(sp.page) || 1,
    perPage: PER_PAGE,
  };

  const [settings, result, features] = await Promise.all([
    getSettings(),
    getCourses(filters),
    getFeatures({ placement: 'home', limit: 4 }),
  ]);

  return (
    <>
      <PageHero
        eyebrow={`${result.total} ${result.total === 1 ? 'programme' : 'programmes'}`}
        title={settings.courses_page_title}
        text={settings.courses_page_text}
        image={settings.courses_page_banner}
        crumbs={[{ label: 'Courses' }]}
      />

      <section className="section bg-ink-50">
        <div className="shell">
          <Suspense
            fallback={
              <div className="flex items-center justify-center gap-3 py-20 text-ink-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading courses…
              </div>
            }
          >
            <CourseCatalogue
              courses={result.items}
              pagination={{
                page: result.page,
                totalPages: result.totalPages,
                total: result.total,
                hasPrev: result.hasPrev,
                hasNext: result.hasNext,
              }}
              levels={LEVELS}
              modes={DELIVERY_MODES}
              sortOptions={SORT_LABELS}
            />
          </Suspense>
        </div>
      </section>

      <FeaturesSection
        settings={{
          home_features_eyebrow: 'Why learners choose us',
          home_features_title: 'What you get on every Pathwise programme',
          home_features_text: 'The same commitments apply whichever course you pick.',
        }}
        features={features}
      />

      <CtaSection settings={settings} />
    </>
  );
}

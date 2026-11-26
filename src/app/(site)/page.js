import { getSettings } from '@/lib/settings';
import { getPopularCourses } from '@/lib/queries/courses';
import { getFaqs, getFeatures, getHeroSlides, getLearningSteps, getTestimonials } from '@/lib/queries/content';
import HeroSlider from '@/components/home/HeroSlider';
import IntroSection from '@/components/home/IntroSection';
import PopularCourses from '@/components/home/PopularCourses';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProcessSection from '@/components/home/ProcessSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FaqSection from '@/components/home/FaqSection';
import CtaSection from '@/components/home/CtaSection';

export const revalidate = 60;

export async function generateMetadata() {
  const s = await getSettings();
  return {
    // `absolute` stops the root layout's "%s | Site Name" template from
    // appending the brand twice on the homepage.
    title: { absolute: s.seo_title || s.site_name },
    description: s.seo_description,
    alternates: { canonical: '/' },
  };
}

export default async function HomePage() {
  // One parallel fetch per section — the database round trips overlap instead
  // of queuing up behind each other.
  const [settings, slides, courses, features, steps, testimonials, faqs] = await Promise.all([
    getSettings(),
    getHeroSlides(),
    getPopularCourses(6),
    getFeatures({ placement: 'home', limit: 8 }),
    getLearningSteps(4),
    getTestimonials({ limit: 10 }),
    getFaqs({ homeOnly: true, limit: 7 }),
  ]);

  const organisationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: settings.site_name,
    description: settings.seo_description || settings.site_description,
    url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    email: settings.contact_email || undefined,
    telephone: settings.contact_phone || undefined,
    address: settings.contact_address
      ? { '@type': 'PostalAddress', streetAddress: String(settings.contact_address).replace(/\n/g, ', ') }
      : undefined,
    sameAs: [
      settings.social_facebook,
      settings.social_instagram,
      settings.social_linkedin,
      settings.social_youtube,
      settings.social_twitter,
    ].filter(Boolean),
  };

  const faqSchema = faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        // Structured data for search engines; content is our own, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
      />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <div className="home-compact">
        <HeroSlider slides={slides} />
        <IntroSection settings={settings} />
        <PopularCourses settings={settings} courses={courses} />
        <FeaturesSection settings={settings} features={features} />
        <ProcessSection settings={settings} steps={steps} />
        {/* TestimonialsSection is a Client Component (scroll rail), so it is
            given only the three headings it reads rather than all of settings. */}
        <TestimonialsSection
          settings={{
            home_testimonials_eyebrow: settings.home_testimonials_eyebrow,
            home_testimonials_title: settings.home_testimonials_title,
            home_testimonials_text: settings.home_testimonials_text,
          }}
          testimonials={testimonials}
        />
        <FaqSection settings={settings} faqs={faqs} />
        <CtaSection settings={settings} />
      </div>
    </>
  );
}

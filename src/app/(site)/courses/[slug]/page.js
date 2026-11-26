import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Award, BadgeCheck, BookOpen, Briefcase, CalendarClock, CircleCheck, Clock, GraduationCap,
  Languages, Layers, Monitor, Quote, Signal, Star, Target, Users,
} from 'lucide-react';
import { getPublicFormSettings, getSettings } from '@/lib/settings';
import { getAllCourseSlugs, getCourseBySlug, getCourseOptions, getRelatedCourses } from '@/lib/queries/courses';
import { getFaqs } from '@/lib/queries/content';
import { compactNumber, excerpt, linesToArray } from '@/lib/utils';
import PageHero from '@/components/layout/PageHero';
import Accordion from '@/components/ui/Accordion';
import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import SmartImage from '@/components/ui/SmartImage';
import CourseCard from '@/components/course/CourseCard';
import EnquiryForm from '@/components/forms/EnquiryForm';
import CourseShortlistBar from '@/components/courses/CourseShortlistBar';

export const revalidate = 300;

/** Pre-render every active course at build time; new ones render on demand. */
export async function generateStaticParams() {
  const slugs = await getAllCourseSlugs();
  return slugs.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: 'Course not found' };

  return {
    title: course.meta_title || course.title,
    description: course.meta_description || excerpt(course.short_description || course.overview, 180),
    keywords: course.meta_keywords ? course.meta_keywords.split(',').map((k) => k.trim()) : undefined,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: {
      type: 'article',
      title: course.meta_title || course.title,
      description: course.meta_description || course.short_description || undefined,
      images: course.banner_image || course.thumbnail ? [{ url: course.banner_image || course.thumbnail }] : undefined,
    },
  };
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const [settings, formSettings, related, courseOptions, siteFaqs] = await Promise.all([
    getSettings(),
    getPublicFormSettings(),
    getRelatedCourses(course.id, 3),
    getCourseOptions(),
    getFaqs({ limit: 5 }),
  ]);

  const faqs = course.faqs.length ? course.faqs : siteFaqs;

  const facts = [
    { icon: Clock, label: 'Duration', value: course.duration },
    { icon: Signal, label: 'Level', value: course.level },
    { icon: Monitor, label: 'Format', value: course.delivery_mode },
    { icon: BookOpen, label: 'Sessions', value: course.lessons_count ? `${course.lessons_count} sessions` : null },
    { icon: Languages, label: 'Language', value: course.language },
    { icon: Award, label: 'Certification', value: course.certification },
  ].filter((f) => f.value);

  const careers = String(course.career_opportunities || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: excerpt(course.short_description || course.overview, 300),
    provider: { '@type': 'EducationalOrganization', name: settings.site_name },
    educationalLevel: course.level,
    inLanguage: course.language,
    ...(Number(course.rating) > 0 && Number(course.reviews_count) > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(course.rating),
            reviewCount: Number(course.reviews_count),
            bestRating: 5,
          },
        }
      : {}),
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: course.delivery_mode,
      courseWorkload: course.duration,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />

      {/* ------------------------------- banner -------------------------------- */}
      <PageHero
        eyebrow={[course.level, course.delivery_mode].filter(Boolean).join(' · ')}
        title={course.title}
        text={course.short_description}
        image={course.banner_image || course.thumbnail}
        crumbs={[{ label: 'Courses', href: '/courses' }, { label: course.title }]}
      >
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
          {Number(course.rating) > 0 && (
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={i < Math.round(course.rating) ? 'h-4 w-4 fill-accent-400 text-accent-400' : 'h-4 w-4 fill-white/25 text-white/25'}
                    strokeWidth={0}
                  />
                ))}
              </span>
              <span className="font-display font-bold text-white">{Number(course.rating).toFixed(1)}</span>
              {Number(course.reviews_count) > 0 && <span className="text-white/55">({course.reviews_count} reviews)</span>}
            </span>
          )}
          {Number(course.students_enrolled) > 0 && (
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-300" strokeWidth={2.2} />
              {compactNumber(course.students_enrolled)} learners trained
            </span>
          )}
          {course.code && (
            <span className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-300" strokeWidth={2.2} />
              Course code {course.code}
            </span>
          )}
        </div>
      </PageHero>

      {/* ------------------------------ fact strip ----------------------------- */}
      <section className="border-b border-ink-200 bg-white">
        <div className="shell">
          <dl className="grid grid-cols-2 divide-ink-200 sm:grid-cols-3 sm:divide-x lg:grid-cols-6">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-center gap-3 px-0 py-5 sm:px-5 lg:py-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <fact.icon className="h-5 w-5" strokeWidth={2.1} />
                </span>
                <span className="min-w-0">
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-400">{fact.label}</dt>
                  <dd className="mt-0.5 truncate font-display text-sm font-bold text-ink-950" title={fact.value}>
                    {fact.value}
                  </dd>
                </span>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------- content ------------------------------- */}
      <section className="section bg-ink-50">
        <div className="shell grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-start lg:gap-12">
          {/* ------------------------------ main ------------------------------ */}
          <div className="space-y-12">
            {/* overview */}
            {course.overview && (
              <Reveal>
                <article className="rounded-[var(--radius-card)] border border-ink-200 bg-white p-6 md:p-8">
                  <h2 className="font-display text-2xl font-bold text-ink-950">About this programme</h2>
                  <div
                    className="prose-cms mt-5"
                    // Course copy is authored in the admin rich-text editor by
                    // trusted staff; it is intentionally rendered as markup.
                    dangerouslySetInnerHTML={{ __html: course.overview }}
                  />
                </article>
              </Reveal>
            )}

            {/* highlights */}
            {course.highlights.length > 0 && (
              <Reveal>
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink-950">What makes it different</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {course.highlights.map((h) => (
                      <div
                        key={h.id}
                        className="flex gap-4 rounded-2xl border border-ink-200 bg-white p-5 transition-shadow hover:shadow-[var(--shadow-soft)]"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent-700">
                          <Icon name={h.icon} className="h-5.5 w-5.5" strokeWidth={2.1} />
                        </span>
                        <div>
                          <h3 className="font-display text-[0.9375rem] font-bold text-ink-950">{h.title}</h3>
                          {h.description && <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{h.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* learning outcomes */}
            {course.outcomes.length > 0 && (
              <Reveal>
                <div className="rounded-[var(--radius-card)] border border-teal-200 bg-linear-to-br from-teal-50 to-white p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-500 text-white">
                      <Target className="h-5.5 w-5.5" strokeWidth={2.2} />
                    </span>
                    <h2 className="font-display text-2xl font-bold text-ink-950">What you will be able to do</h2>
                  </div>
                  <ul className="mt-6 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
                    {course.outcomes.map((o) => (
                      <li key={o.id} className="flex items-start gap-3">
                        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" strokeWidth={2.2} />
                        <span className="text-[0.9375rem] leading-relaxed text-ink-700">{o.outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            {/* syllabus */}
            {course.syllabus.length > 0 && (
              <Reveal>
                <div>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <h2 className="font-display text-2xl font-bold text-ink-950">Curriculum</h2>
                    <p className="text-sm text-ink-500">
                      {course.syllabus.length} modules
                      {course.duration ? ` · ${course.duration}` : ''}
                    </p>
                  </div>

                  <Accordion
                    className="mt-5"
                    variant="numbered"
                    allowMultiple
                    defaultOpen={[0]}
                    items={course.syllabus.map((m) => {
                      const topics = linesToArray(m.topics);
                      return {
                        id: m.id,
                        title: m.module_title,
                        meta: m.duration || null,
                        // Panel content is built here as JSX rather than via a
                        // render prop — functions cannot cross into a Client
                        // Component, but elements can.
                        body: (
                          <div>
                            {m.description && <p className="text-ink-600">{m.description}</p>}
                            {topics.length > 0 && (
                              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                                {topics.map((topic) => (
                                  <li key={topic} className="flex items-start gap-2.5 text-sm">
                                    <span
                                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                                      aria-hidden="true"
                                    />
                                    <span className="text-ink-700">{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ),
                      };
                    })}
                  />
                </div>
              </Reveal>
            )}

            {/* who / eligibility / careers */}
            <div className="grid gap-5 sm:grid-cols-2">
              {course.who_should_attend && (
                <Reveal>
                  <div className="h-full rounded-[var(--radius-card)] border border-ink-200 bg-white p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Users className="h-5.5 w-5.5" strokeWidth={2.1} />
                    </span>
                    <h2 className="mt-4 font-display text-lg font-bold text-ink-950">Who it is for</h2>
                    <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-600">{course.who_should_attend}</p>
                  </div>
                </Reveal>
              )}

              {course.eligibility && (
                <Reveal delay={80}>
                  <div className="h-full rounded-[var(--radius-card)] border border-ink-200 bg-white p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-50 text-accent-700">
                      <GraduationCap className="h-5.5 w-5.5" strokeWidth={2.1} />
                    </span>
                    <h2 className="mt-4 font-display text-lg font-bold text-ink-950">Entry requirements</h2>
                    <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-600">{course.eligibility}</p>
                  </div>
                </Reveal>
              )}
            </div>

            {careers.length > 0 && (
              <Reveal>
                <div className="rounded-[var(--radius-card)] border border-ink-200 bg-white p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-950 text-white">
                      <Briefcase className="h-5.5 w-5.5" strokeWidth={2.1} />
                    </span>
                    <h2 className="font-display text-2xl font-bold text-ink-950">Where it can take you</h2>
                  </div>
                  <ul className="mt-6 flex flex-wrap gap-2.5">
                    {careers.map((career) => (
                      <li
                        key={career}
                        className="rounded-full border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-medium text-ink-800"
                      >
                        {career}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-sm text-ink-500">
                    Placement support — CV clinics, mock interviews and employer introductions — continues for twelve
                    months after you graduate.
                  </p>
                </div>
              </Reveal>
            )}

            {/* testimonials for this course */}
            {course.testimonials.length > 0 && (
              <Reveal>
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink-950">From people who took it</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {course.testimonials.map((t) => (
                      <figure key={t.id} className="rounded-[var(--radius-card)] border border-ink-200 bg-white p-6">
                        <Quote className="h-7 w-7 text-brand-200" strokeWidth={1.8} aria-hidden="true" />
                        <blockquote className="mt-3 text-[0.9375rem] leading-relaxed text-ink-700">
                          “{t.message}”
                        </blockquote>
                        <figcaption className="mt-5 flex items-center gap-3 border-t border-ink-200 pt-4">
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-ink-100">
                            <SmartImage src={t.avatar} alt="" fill sizes="40px" fallbackIcon="Users" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-display text-sm font-bold text-ink-950">{t.name}</span>
                            <span className="block truncate text-xs text-ink-500">
                              {[t.designation, t.organisation].filter(Boolean).join(' · ')}
                            </span>
                          </span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
              <Reveal>
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink-950">
                    {course.faqs.length ? 'Questions about this course' : 'Frequently asked questions'}
                  </h2>
                  <Accordion className="mt-5" items={faqs} defaultOpen={[0]} />
                </div>
              </Reveal>
            )}
          </div>

          {/* ----------------------------- sidebar ---------------------------- */}
          <aside className="space-y-5 lg:sticky lg:top-28">
            <div id="enquire">
              <EnquiryForm
                course={{ id: course.id, title: course.title, slug: course.slug }}
                courseOptions={courseOptions}
                settings={formSettings}
              />
            </div>

            {/* at a glance */}
            <div className="rounded-[var(--radius-card)] border border-ink-200 bg-white p-6">
              <h2 className="font-display text-base font-bold text-ink-950">At a glance</h2>
              <dl className="mt-4 divide-y divide-ink-200 text-sm">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="flex items-center gap-2 text-ink-500">
                      <fact.icon className="h-4 w-4 shrink-0 text-brand-500" strokeWidth={2.1} />
                      {fact.label}
                    </dt>
                    <dd className="text-right font-medium text-ink-900">{fact.value}</dd>
                  </div>
                ))}
                {course.fee_text && (
                  <div className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="flex items-center gap-2 text-ink-500">
                      <CalendarClock className="h-4 w-4 shrink-0 text-brand-500" strokeWidth={2.1} />
                      Fees
                    </dt>
                    <dd className="text-right font-medium text-ink-900">{course.fee_text}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-teal-50 p-3.5">
                <BadgeCheck className="mt-px h-4.5 w-4.5 shrink-0 text-teal-600" strokeWidth={2.2} />
                <p className="text-xs leading-relaxed text-teal-900">
                  Interest-free instalments available on programmes over twelve weeks. Ask your advisor.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* --------------------------- related courses --------------------------- */}
      {related.length > 0 && (
        <section className="section bg-white">
          <div className="shell">
            <SectionHeading
              eyebrow="Also worth considering"
              title="Related programmes"
              highlight="Related"
              text="Learners who enquired about this course often compared it with these. Shortlist as many as you like — one enquiry covers them all."
              align="left"
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <Reveal key={item.id} delay={i * 70}>
                  <CourseCard course={item} className="h-full" />
                </Reveal>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/courses" className="btn btn-outline">
                Browse all courses
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* sticky mobile enquiry bar */}
      <CourseShortlistBar course={{ id: course.id, title: course.title, slug: course.slug }} />
    </>
  );
}

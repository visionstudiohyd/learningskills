import Link from 'next/link';
import { ArrowRight, MessagesSquare } from 'lucide-react';
import { getSettings } from '@/lib/settings';
import { getFaqsGrouped } from '@/lib/queries/content';
import PageHero from '@/components/layout/PageHero';
import Accordion from '@/components/ui/Accordion';
import Reveal from '@/components/ui/Reveal';
import CtaSection from '@/components/home/CtaSection';

export const revalidate = 300;

export async function generateMetadata() {
  const s = await getSettings();
  return {
    title: s.faq_page_title || 'Frequently Asked Questions',
    description: s.faq_page_text || s.seo_description,
    alternates: { canonical: '/faqs' },
  };
}

export default async function FaqsPage() {
  const [settings, groups] = await Promise.all([getSettings(), getFaqsGrouped()]);
  const totalQuestions = groups.reduce((sum, g) => sum + g.items.length, 0);

  const faqSchema = totalQuestions
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: groups.flatMap((g) =>
          g.items.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          }))
        ),
      }
    : null;

  return (
    <>
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <PageHero
        eyebrow={`${totalQuestions} questions answered`}
        title={settings.faq_page_title}
        text={settings.faq_page_text}
        crumbs={[{ label: 'FAQs' }]}
      />

      <section className="section bg-ink-50">
        <div className="shell grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12">
          {/* category jump list */}
          <nav className="lg:sticky lg:top-28 lg:self-start" aria-label="FAQ categories">
            <p className="font-display text-sm font-bold uppercase tracking-[0.12em] text-ink-400">Categories</p>
            <ul className="mt-4 space-y-1">
              {groups.map((group) => (
                <li key={group.category}>
                  <a
                    href={`#${group.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-white hover:text-brand-700"
                  >
                    {group.category}
                    <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[0.6875rem] font-bold text-ink-500">
                      {group.items.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-7 rounded-[var(--radius-card)] border border-brand-200 bg-white p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-white">
                <MessagesSquare className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <h2 className="mt-3.5 font-display text-sm font-bold text-ink-950">Not covered here?</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
                Ask us directly and a course advisor will reply with a straight answer.
              </p>
              <Link href="/contact" className="btn btn-primary btn-sm mt-4 w-full">
                Ask a question
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </Link>
            </div>
          </nav>

          {/* grouped questions */}
          <div className="space-y-10">
            {groups.length === 0 ? (
              <p className="rounded-[var(--radius-card)] border border-dashed border-ink-300 bg-white px-6 py-12 text-center text-ink-500">
                No questions have been published yet.
              </p>
            ) : (
              groups.map((group, gi) => (
                <section
                  key={group.category}
                  id={group.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                  className="scroll-mt-28"
                >
                  <Reveal>
                    <h2 className="font-display text-xl font-bold text-ink-950 md:text-2xl">{group.category}</h2>
                  </Reveal>
                  <Reveal delay={80}>
                    <Accordion className="mt-5" items={group.items} defaultOpen={gi === 0 ? [0] : []} />
                  </Reveal>
                </section>
              ))
            )}
          </div>
        </div>
      </section>

      <CtaSection settings={settings} />
    </>
  );
}

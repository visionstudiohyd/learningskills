import Link from 'next/link';
import { ArrowRight, MessagesSquare } from 'lucide-react';
import Accordion from '@/components/ui/Accordion';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

/**
 * Homepage FAQ. Two columns on desktop: the heading and a help card on the
 * left, the accordion on the right — keeps the questions scannable instead of
 * stretching them across the full width.
 */
export default function FaqSection({ settings = {}, faqs = [], phone, email }) {
  if (!faqs.length) return null;

  return (
    <section className="section bg-white">
      <div className="shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            eyebrow={settings.home_faq_eyebrow}
            title={settings.home_faq_title}
            highlight="probably wondering"
            text={settings.home_faq_text}
            align="left"
          />

          <Reveal delay={200}>
            <div className="mt-6 rounded-[var(--radius-card)] border border-brand-200 bg-brand-50/60 p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500 text-white">
                <MessagesSquare className="h-5.5 w-5.5" strokeWidth={2.2} />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink-950">Still not answered?</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                Ask us directly. A course advisor — not a chatbot — will reply with a straight answer, including when
                the honest answer is that a course is not right for you.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link href="/contact" className="btn btn-primary btn-sm">
                  Ask a question
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                </Link>
                <Link href="/faqs" className="btn btn-outline btn-sm">
                  All FAQs
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <Accordion items={faqs} defaultOpen={[0]} />
        </Reveal>
      </div>
    </section>
  );
}

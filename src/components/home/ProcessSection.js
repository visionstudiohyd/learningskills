import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

/**
 * "How it works" — the enquiry journey in four steps.
 *
 * The connecting line is drawn with a pseudo-element on the container rather
 * than per-card borders, so it stays unbroken on desktop and disappears cleanly
 * when the cards stack on mobile.
 */
export default function ProcessSection({ settings = {}, steps = [] }) {
  if (!steps.length) return null;

  return (
    <section className="section bg-white">
      <div className="shell">
        <SectionHeading
          eyebrow={settings.home_process_eyebrow}
          title={settings.home_process_title}
          highlight="four steps"
          text={settings.home_process_text}
        />

        <div className="relative mt-10">
          {/* connector */}
          <div
            className="absolute left-0 right-0 top-7 hidden h-px bg-linear-to-r from-transparent via-brand-200 to-transparent lg:block"
            aria-hidden="true"
          />

          <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.id} delay={i * 110} className="relative">
                {/* numbered node */}
                <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                  <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white shadow-[var(--shadow-brand)] ring-4 ring-white">
                    <Icon name={step.icon} className="h-6 w-6" strokeWidth={2.2} />
                    <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-accent-400 font-display text-[0.6875rem] font-extrabold text-ink-950 ring-2 ring-white">
                      {step.step_label}
                    </span>
                  </span>

                  <h3 className="font-display text-[1.0625rem] font-bold leading-snug text-ink-950 lg:mt-5">
                    {step.title}
                  </h3>
                </div>

                {step.description && (
                  <p className="mt-3 text-sm leading-relaxed text-ink-600 lg:pr-4">{step.description}</p>
                )}
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={200}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/courses" className="btn btn-primary btn-lg">
              Start at step one
              <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.4} />
            </Link>
            <Link href="/contact" className="btn btn-outline btn-lg">
              Skip ahead — talk to an advisor
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

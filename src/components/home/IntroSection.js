import Link from 'next/link';
import { ArrowRight, BadgeCheck, Quote } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import Reveal from '@/components/ui/Reveal';

const DEFAULT_PRIMARY = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80';
const DEFAULT_SECONDARY = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80';

const PROOF_POINTS = [
  'Syllabi reviewed with hiring managers every quarter',
  'Trainers who still work in the field they teach',
  'Assessed project work, not attendance certificates',
  'One advisor from first question to final class',
];

/**
 * "Who we are" introduction — an overlapping image composition paired with the
 * institute's positioning statement and four hard proof points.
 */
export default function IntroSection({ settings = {} }) {
  return (
    <section className="section relative overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-brand-100/50 blur-3xl"
        aria-hidden="true"
      />
      <div className="shell relative grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        {/* ------------------------------ visuals ----------------------------- */}
        <Reveal direction="right" className="relative">
          <div className="relative mx-auto max-w-lg lg:max-w-none">
            {/* primary image */}
            <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)] sm:aspect-4/3">
              <SmartImage
                src={settings.home_intro_image || DEFAULT_PRIMARY}
                alt="Learners working together in a Pathwise Academy session"
                fill
                sizes="(max-width: 1024px) 90vw, 36rem"
              />
            </div>

            {/* secondary image, offset */}
            <div className="absolute -bottom-10 -right-4 hidden aspect-square w-44 overflow-hidden rounded-3xl border-4 border-white shadow-[var(--shadow-lift)] sm:block lg:-right-10 lg:w-52">
              <SmartImage
                src={settings.home_intro_secondary_image || DEFAULT_SECONDARY}
                alt="A trainer reviewing a learner's project work"
                fill
                sizes="13rem"
              />
            </div>
          </div>
        </Reveal>

        {/* ------------------------------ copy -------------------------------- */}
        <div>
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-6 bg-brand-400/60" aria-hidden="true" />
              {settings.home_intro_eyebrow || 'Who we are'}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="mt-3 text-display-md text-ink-950 md:text-display-lg">
              {settings.home_intro_title}
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-600">{settings.home_intro_text}</p>
          </Reveal>

          <Reveal delay={200}>
            <blockquote className="relative mt-5 rounded-2xl border-l-[3px] border-accent-400 bg-accent-50/70 p-5 pl-6">
              <Quote className="absolute right-4 top-4 h-8 w-8 text-accent-300/50" strokeWidth={1.5} aria-hidden="true" />
              <p className="relative font-display text-[0.9375rem] font-medium italic leading-relaxed text-ink-800">
                “We would rather tell you a course is wrong for you than enrol you in it. That conversation is why
                people send us their colleagues.”
              </p>
              <footer className="mt-3 text-xs font-semibold text-ink-600">
                Dr. Ananya Varma — Founder &amp; Academic Director
              </footer>
            </blockquote>
          </Reveal>

          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {PROOF_POINTS.map((point, i) => (
              <Reveal as="li" key={point} delay={240 + i * 60} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700">
                  <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.6} />
                </span>
                <span className="text-sm leading-snug text-ink-700">{point}</span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={520}>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/about" className="btn btn-primary">
                Our story
                <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </Link>
              <Link href="/courses" className="btn btn-outline">
                Browse programmes
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

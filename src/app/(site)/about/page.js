import { Compass, Lightbulb, Linkedin, Mail, Quote, Target, Twitter } from 'lucide-react';
import { getSettings } from '@/lib/settings';
import { getStats, getTrainers } from '@/lib/queries/content';
import PageHero from '@/components/layout/PageHero';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import SmartImage from '@/components/ui/SmartImage';
import Counter from '@/components/ui/Counter';
import CtaSection from '@/components/home/CtaSection';

export const revalidate = 300;

export async function generateMetadata() {
  const s = await getSettings();
  return {
    title: s.about_page_title || 'About Us',
    description: s.about_page_text || s.seo_description,
    alternates: { canonical: '/about' },
  };
}

/* The institute's own narrative. Editable copy lives in settings; this page's
   structure is fixed because its job is credibility, not flexibility. */
const TIMELINE = [
  {
    year: '2014',
    title: 'Founded in a single borrowed classroom',
    text: 'Three practitioners started teaching weekend courses because the training they saw in the market did not translate into work. Twelve learners in the first cohort.',
  },
  {
    year: '2017',
    title: 'The employer advisory panel',
    text: 'We began reviewing every syllabus with hiring managers from partner companies. It changed what we taught more than any internal review ever had.',
  },
  {
    year: '2020',
    title: 'Online, properly',
    text: 'Rather than streaming existing classes, we rebuilt them for remote delivery — smaller groups, more structured critique, every session recorded and kept.',
  },
  {
    year: '2023',
    title: 'Twelve-month placement support',
    text: 'We extended career support from "until the course ends" to a full year after graduation, because that is when most learners actually start applying.',
  },
  {
    year: '2026',
    title: '34 programmes, nine disciplines',
    text: 'Still capped cohorts, still practitioner-taught, still the same rule: if a course is wrong for you, we will say so.',
  },
];

const PILLARS = [
  {
    icon: Target,
    label: 'Our mission',
    title: 'Turn ambition into a qualification employers recognise',
    text: 'Every programme we run has to answer one question: will this measurably improve what the learner can do, and can they prove it? If the answer is no, we do not run it.',
  },
  {
    icon: Compass,
    label: 'Our vision',
    title: 'Professional education without the theatre',
    text: 'No guaranteed-job promises, no inflated placement statistics, no courses designed around what is easy to teach. Training judged on what graduates can actually do.',
  },
  {
    icon: Lightbulb,
    label: 'Our method',
    title: 'Seventy per cent doing, thirty per cent being taught',
    text: 'Concepts are introduced briefly and then practised at length, with structured critique. Learners leave with reviewed work, not lecture notes.',
  },
];

const METHOD_STEPS = [
  { n: '01', title: 'Industry review', text: 'Every syllabus is reviewed each quarter with hiring managers who employ our graduates.' },
  { n: '02', title: 'Practitioner teaching', text: 'Trainers are working professionals, not career lecturers. Course content changes when their field does.' },
  { n: '03', title: 'Assessed project work', text: 'Each module ends in something examinable — code, a model, an audit, a case presentation.' },
  { n: '04', title: 'Structured critique', text: 'Weekly review by a mentor and by peers. Receiving and giving feedback is treated as a core skill.' },
  { n: '05', title: 'Capstone and defence', text: 'Every programme closes with a substantial piece of work you present and defend under challenge.' },
  { n: '06', title: 'A year of support', text: 'CV clinics, portfolio review, mock interviews and employer introductions for twelve months after you finish.' },
];

export default async function AboutPage() {
  const [settings, trainers, stats] = await Promise.all([getSettings(), getTrainers(4), getStats(4)]);

  return (
    <>
      <PageHero
        eyebrow="Since 2014"
        title={settings.about_page_title}
        text={settings.about_page_text}
        image={settings.about_page_banner}
        crumbs={[{ label: 'About Us' }]}
      />

      {/* --------------------------- stats strip ---------------------------- */}
      {stats.length > 0 && (
        <section className="border-b border-ink-200 bg-white">
          <div className="shell">
            <dl className="grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-4 md:py-12">
              {stats.map((stat) => (
                <div key={stat.id} className="text-center">
                  <dd className="font-display text-3xl font-extrabold tracking-tight text-ink-950 md:text-4xl">
                    {stat.prefix}
                    {stat.suffix === '/5' ? (
                      <Counter value={Number(stat.value) / 10} decimals={1} />
                    ) : (
                      <Counter value={stat.value} />
                    )}
                    <span className="text-brand-500">{stat.suffix}</span>
                  </dd>
                  <dt className="mx-auto mt-2 max-w-[12rem] text-[0.8125rem] leading-snug text-ink-500">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* ------------------------------ story ------------------------------- */}
      <section className="section bg-ink-50">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Our story"
              title="Built by people who were frustrated with training"
              highlight="frustrated"
              align="left"
            />
            <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed text-ink-600">
              <p>
                Learning Skills exists because its founders kept interviewing candidates who held certificates but
                could not do the work. The certificates were not fraudulent — the courses behind them had simply been
                designed around what was convenient to teach and easy to assess.
              </p>
              <p>
                So we started with the opposite constraint. Every programme begins with a conversation with people who
                hire for that role: what do your new joiners struggle with, what do you wish they arrived knowing, what
                do you not care about at all? The syllabus is built backwards from those answers and reviewed against
                them every quarter.
              </p>
              <p>
                That approach has two uncomfortable consequences we have chosen to live with. Our cohorts are small,
                because structured critique does not scale. And we turn away enrolments — if a programme will not get
                someone where they want to go, our advisors are instructed to say so, even when the learner is ready to
                pay.
              </p>
            </div>

            <Reveal delay={200}>
              <div className="mt-8 rounded-[var(--radius-card)] border border-brand-200 bg-white p-6">
                <Quote className="h-8 w-8 text-brand-200" strokeWidth={1.8} aria-hidden="true" />
                <blockquote className="mt-3 font-display text-lg font-medium italic leading-relaxed text-ink-800">
                  “The question we ask about every course is not ‘will it sell’ but ‘will a hiring manager notice the
                  difference’. Those are not the same question, and the gap between them is most of what is wrong with
                  professional education.”
                </blockquote>
                <footer className="mt-4 text-sm font-semibold text-ink-600">
                  Dr. Ananya Varma — Founder &amp; Academic Director
                </footer>
              </div>
            </Reveal>
          </div>

          {/* timeline */}
          <div>
            <ol className="relative space-y-7 border-l-2 border-ink-200 pl-7">
              {TIMELINE.map((item, i) => (
                <Reveal as="li" key={item.year} delay={i * 80} className="relative">
                  <span
                    className="absolute -left-[2.3rem] grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-brand-500 font-display text-[0.625rem] font-extrabold text-white shadow-sm"
                    aria-hidden="true"
                  >
                    ●
                  </span>
                  <span className="font-display text-sm font-extrabold tracking-wide text-brand-600">{item.year}</span>
                  <h3 className="mt-1 font-display text-lg font-bold text-ink-950">{item.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">{item.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* --------------------------- mission pillars ------------------------ */}
      <section className="section bg-white">
        <div className="shell">
          <SectionHeading
            eyebrow="What we stand for"
            title="Three commitments we are willing to be held to"
            highlight="held to"
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <Reveal key={pillar.label} delay={i * 90}>
                <article className="h-full rounded-[var(--radius-card)] border border-ink-200 bg-ink-50 p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:bg-white hover:shadow-[var(--shadow-lift)]">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-[var(--shadow-brand)]">
                    <pillar.icon className="h-6 w-6" strokeWidth={2.1} />
                  </span>
                  <p className="mt-5 font-display text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
                    {pillar.label}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold leading-snug text-ink-950">{pillar.title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-600">{pillar.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- methodology -------------------------- */}
      <section className="section relative overflow-hidden bg-ink-950">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(50rem 25rem at 15% 0%, rgb(7 7 88 / 0.32), transparent 65%), radial-gradient(40rem 20rem at 90% 100%, rgb(15 185 168 / 0.15), transparent 65%)',
          }}
          aria-hidden="true"
        />
        <div className="shell relative">
          <SectionHeading
            eyebrow="How we teach"
            title="The same six steps on every programme"
            highlight="six steps"
            text="Whether it is a six-week Excel course or a twenty-week design programme, the teaching method does not change."
            tone="dark"
          />

          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {METHOD_STEPS.map((step, i) => (
              <Reveal as="li" key={step.n} delay={i * 70}>
                <div className="h-full rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.07]">
                  <span className="font-display text-3xl font-extrabold leading-none text-accent-400/70">{step.n}</span>
                  <h3 className="mt-4 font-display text-[1.0625rem] font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------ trainers ---------------------------- */}
      {trainers.length > 0 && (
        <section id="trainers" className="section bg-ink-50">
          <div className="shell">
            <SectionHeading
              eyebrow="The people teaching"
              title="Practitioners first, trainers second"
              highlight="Practitioners first"
              text="Every lead trainer still works in the field they teach. That is the whole reason our content stays current."
            />

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {trainers.slice(0, 4).map((trainer, i) => (
                <Reveal key={trainer.id} delay={(i % 4) * 80}>
                  <article className="group h-full overflow-hidden rounded-[var(--radius-card)] border border-ink-200 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]">
                    <div className="relative aspect-4/5 overflow-hidden bg-ink-100">
                      <SmartImage
                        src={trainer.photo}
                        alt={trainer.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20rem"
                        fallbackIcon="UserCheck"
                        className="transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 bg-linear-to-t from-ink-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                      {(trainer.linkedin_url || trainer.twitter_url || trainer.email) && (
                        <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100">
                          {trainer.linkedin_url && (
                            <a
                              href={trainer.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${trainer.name} on LinkedIn`}
                              className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-ink-800 transition-colors hover:bg-brand-500 hover:text-white"
                            >
                              <Linkedin className="h-4 w-4" strokeWidth={2.1} />
                            </a>
                          )}
                          {trainer.twitter_url && (
                            <a
                              href={trainer.twitter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${trainer.name} on X`}
                              className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-ink-800 transition-colors hover:bg-brand-500 hover:text-white"
                            >
                              <Twitter className="h-4 w-4" strokeWidth={2.1} />
                            </a>
                          )}
                          {trainer.email && (
                            <a
                              href={`mailto:${trainer.email}`}
                              aria-label={`Email ${trainer.name}`}
                              className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 text-ink-800 transition-colors hover:bg-brand-500 hover:text-white"
                            >
                              <Mail className="h-4 w-4" strokeWidth={2.1} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-display text-[1.0625rem] font-bold leading-snug text-ink-950">
                        {trainer.name}
                      </h3>
                      {trainer.designation && (
                        <p className="mt-1 text-[0.8125rem] font-semibold text-brand-600">{trainer.designation}</p>
                      )}
                      {trainer.bio && <p className="clamp-4 mt-3 text-sm leading-relaxed text-ink-600">{trainer.bio}</p>}

                      <dl className="mt-4 space-y-1.5 border-t border-ink-200 pt-4 text-xs">
                        {trainer.experience_years && (
                          <div className="flex gap-2">
                            <dt className="text-ink-400">Experience</dt>
                            <dd className="font-semibold text-ink-800">{trainer.experience_years} years</dd>
                          </div>
                        )}
                        {trainer.expertise && (
                          <div>
                            <dt className="text-ink-400">Specialisms</dt>
                            <dd className="mt-0.5 leading-snug text-ink-700">{trainer.expertise}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection settings={settings} />
    </>
  );
}

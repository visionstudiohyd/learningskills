import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

/**
 * Benefits grid. Each card carries its own accent colour from the database, so
 * the admin can re-theme the section without touching code.
 */
export default function FeaturesSection({ settings = {}, features = [], tone = 'light' }) {
  if (!features.length) return null;

  const isDark = tone === 'dark';

  return (
    <section className={isDark ? 'section relative overflow-hidden bg-ink-950' : 'section bg-ink-50'}>
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(50rem 25rem at 20% 0%, rgb(7 7 88 / 0.3), transparent 65%), radial-gradient(40rem 20rem at 85% 100%, rgb(15 185 168 / 0.16), transparent 65%)',
          }}
          aria-hidden="true"
        />
      )}

      <div className="shell relative">
        <SectionHeading
          eyebrow={settings.home_features_eyebrow}
          title={settings.home_features_title}
          highlight="a job, a life, and a goal"
          text={settings.home_features_text}
          tone={tone}
        />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Reveal key={feature.id} delay={i * 60}>
              <article
                className={
                  isDark
                    ? 'group relative h-full overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 hover:bg-white/[0.07]'
                    : 'group relative h-full overflow-hidden rounded-[var(--radius-card)] border border-ink-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[var(--shadow-lift)]'
                }
              >
                {/* accent wash that only appears on hover */}
                <span
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                  style={{ backgroundColor: feature.accent }}
                  aria-hidden="true"
                />

                <span
                  className="relative grid h-12 w-12 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: isDark ? `${feature.accent}2e` : `${feature.accent}1a`,
                    color: feature.accent,
                  }}
                >
                  <Icon name={feature.icon} className="h-6 w-6" strokeWidth={2.1} />
                </span>

                <h3
                  className={
                    isDark
                      ? 'relative mt-5 font-display text-[1.0625rem] font-bold leading-snug text-white'
                      : 'relative mt-5 font-display text-[1.0625rem] font-bold leading-snug text-ink-950'
                  }
                >
                  {feature.title}
                </h3>

                {feature.description && (
                  <p
                    className={
                      isDark
                        ? 'relative mt-2.5 text-sm leading-relaxed text-white/65'
                        : 'relative mt-2.5 text-sm leading-relaxed text-ink-600'
                    }
                  >
                    {feature.description}
                  </p>
                )}

                {/* bottom accent rule */}
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: feature.accent }}
                  aria-hidden="true"
                />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

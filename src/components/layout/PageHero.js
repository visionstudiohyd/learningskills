import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cx } from '@/lib/utils';
import Reveal from '@/components/ui/Reveal';
import SmartImage from '@/components/ui/SmartImage';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1541178735493-479c1a27ed24?auto=format&fit=crop&w=1800&q=80';

/**
 * Inner-page banner with breadcrumbs.
 *
 * Deliberately shorter than the homepage hero — inner pages should get the
 * visitor to the content, not perform. `crumbs` is rendered as an ordered list
 * so the trail is meaningful without CSS.
 */
export default function PageHero({
  eyebrow,
  title,
  text,
  image,
  crumbs = [],
  align = 'left',
  children,
  size = 'default',
}) {
  return (
    <section
      className={cx(
        'relative isolate overflow-hidden bg-ink-950',
        size === 'compact' ? 'pb-10 pt-12 md:pb-12 md:pt-16' : 'pb-14 pt-14 md:pb-20 md:pt-20'
      )}
    >
      <SmartImage src={image || DEFAULT_BANNER} alt="" fill sizes="100vw" quality={76} className="object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgb(14 18 34 / 0.95) 0%, rgb(20 22 58 / 0.9) 50%, rgb(35 8 90 / 0.76) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="shell relative">
        {/* breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-white/55">
            <li>
              <Link href="/" className="flex items-center gap-1.5 transition-colors hover:text-white">
                <Home className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span className="sr-only sm:not-sr-only">Home</span>
              </Link>
            </li>
            {crumbs.map((crumb, i) => (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-white/30" strokeWidth={2.4} aria-hidden="true" />
                {crumb.href && i < crumbs.length - 1 ? (
                  <Link href={crumb.href} className="transition-colors hover:text-white">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="max-w-[16rem] truncate text-white/85 sm:max-w-none" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className={cx('mt-6 max-w-3xl', align === 'center' && 'mx-auto text-center')}>
          {eyebrow && (
            <Reveal>
              <span className="eyebrow text-accent-300">
                <span className="h-px w-6 bg-accent-300/50" aria-hidden="true" />
                {eyebrow}
              </span>
            </Reveal>
          )}
          <Reveal delay={60}>
            <h1 className={cx('text-white', size === 'compact' ? 'text-display-md' : 'text-display-md md:text-display-lg')}>
              {title}
            </h1>
          </Reveal>
          {text && (
            <Reveal delay={120}>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-white/70">{text}</p>
            </Reveal>
          )}
          {children && <Reveal delay={180}>{children}</Reveal>}
        </div>
      </div>
    </section>
  );
}

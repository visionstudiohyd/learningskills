import { cx } from '@/lib/utils';
import Reveal from './Reveal';

/**
 * Consistent section header: eyebrow, title (with optional highlighted
 * fragment) and supporting line. Used by every public section so the vertical
 * rhythm and type scale stay identical across the site.
 */
export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  text,
  align = 'center',
  tone = 'light',
  className = '',
  children,
}) {
  if (!title && !eyebrow && !text) return null;

  const alignment = {
    center: 'mx-auto items-center text-center',
    left: 'items-start text-left',
    right: 'ml-auto items-end text-right',
  }[align];

  const isDark = tone === 'dark';

  // Split the title so one phrase can be visually emphasised without markup in the DB.
  let before = title || '';
  let mark = '';
  let after = '';
  if (title && highlight && title.includes(highlight)) {
    const at = title.indexOf(highlight);
    before = title.slice(0, at);
    mark = highlight;
    after = title.slice(at + highlight.length);
  }

  return (
    <div className={cx('flex max-w-3xl flex-col gap-4', alignment, className)}>
      {eyebrow && (
        <Reveal>
          <span className={cx('eyebrow', isDark && 'text-accent-300')}>
            <span className={cx('h-px w-6', isDark ? 'bg-accent-300/60' : 'bg-brand-400/60')} aria-hidden="true" />
            {eyebrow}
          </span>
        </Reveal>
      )}

      {title && (
        <Reveal delay={60}>
          <h2
            className={cx(
              'text-display-md md:text-display-lg',
              isDark ? 'text-white' : 'text-ink-950'
            )}
          >
            {mark ? (
              <>
                {before}
                <span className={isDark ? 'text-accent-300' : 'gradient-text'}>{mark}</span>
                {after}
              </>
            ) : (
              title
            )}
          </h2>
        </Reveal>
      )}

      {text && (
        <Reveal delay={120}>
          <p className={cx('text-[1.0625rem] leading-relaxed', isDark ? 'text-white/75' : 'text-ink-600')}>
            {text}
          </p>
        </Reveal>
      )}

      {children && <Reveal delay={180}>{children}</Reveal>}
    </div>
  );
}

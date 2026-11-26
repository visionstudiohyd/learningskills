import Link from 'next/link';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import { cx, formatNumber } from '@/lib/utils';
import Icon from '@/components/ui/Icon';

const TONES = {
  brand: { bg: 'bg-brand-50', fg: 'text-brand-600', ring: 'ring-brand-100' },
  teal: { bg: 'bg-teal-50', fg: 'text-teal-700', ring: 'ring-teal-100' },
  accent: { bg: 'bg-accent-50', fg: 'text-accent-700', ring: 'ring-accent-100' },
  rose: { bg: 'bg-rose-50', fg: 'text-rose-700', ring: 'ring-rose-100' },
  ink: { bg: 'bg-ink-100', fg: 'text-ink-700', ring: 'ring-ink-200' },
};

/**
 * KPI tile.
 *
 * The number is the loudest element, the label sits above it, and the delta is
 * only coloured when it carries meaning — so a row of these reads as data
 * rather than as decoration.
 */
export default function StatTile({
  label,
  value,
  icon = 'TrendingUp',
  tone = 'brand',
  delta = null,
  deltaLabel = '',
  suffix = '',
  href = null,
  hint = null,
}) {
  const t = TONES[tone] || TONES.brand;
  const hasDelta = delta !== null && delta !== undefined && Number.isFinite(Number(delta));
  const deltaUp = Number(delta) >= 0;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8125rem] font-medium text-ink-500">{label}</p>
        <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1', t.bg, t.fg, t.ring)}>
          <Icon name={icon} className="h-4.5 w-4.5" strokeWidth={2.2} />
        </span>
      </div>

      <p className="mt-3 font-display text-[2rem] font-extrabold leading-none tracking-tight text-ink-950">
        {typeof value === 'number' ? formatNumber(value) : value}
        {suffix && <span className="text-lg text-ink-400">{suffix}</span>}
      </p>

      <div className="mt-2.5 flex items-center gap-2">
        {hasDelta && (
          <span
            className={cx(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold',
              deltaUp ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'
            )}
          >
            {deltaUp ? <TrendingUp className="h-3 w-3" strokeWidth={2.6} /> : <TrendingDown className="h-3 w-3" strokeWidth={2.6} />}
            {deltaUp ? '+' : ''}
            {delta}%
          </span>
        )}
        {(deltaLabel || hint) && <span className="truncate text-[0.6875rem] text-ink-400">{deltaLabel || hint}</span>}
      </div>

      {href && (
        <span className="mt-4 inline-flex items-center gap-1.5 font-display text-xs font-semibold text-brand-600 transition-colors group-hover:text-brand-800">
          View all
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
        </span>
      )}
    </>
  );

  const className = cx(
    'group rounded-2xl border border-ink-200 bg-white p-5 transition-all duration-300',
    href && 'hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-card)]'
  );

  return href ? (
    <Link href={href} className={cx(className, 'block')}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

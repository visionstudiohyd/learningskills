import Link from 'next/link';
import { cx, formatNumber } from '@/lib/utils';

/**
 * Horizontal bar list — magnitude across named rows.
 *
 * Plain HTML rather than a charting library, which buys three things that
 * matter here: the value is always present as text (so it doubles as the table
 * view), the row label carries identity instead of colour, and the mark spec is
 * exact — bars capped in thickness, 4px rounded at the data end and square
 * against the baseline.
 *
 * One series means one colour for every bar. A per-row `tone` is only used for
 * a small status dot beside the label, never to ramp the bars by value.
 */

const STATUS_DOTS = {
  brand: '#070758',
  teal: '#0d9488',
  accent: '#dd7502',
  success: '#059669',
  neutral: '#7b85a6',
  danger: '#e11d48',
};

export default function BarList({
  title,
  description,
  rows = [],
  emptyMessage = 'Nothing to show yet.',
  valueSuffix = '',
  footer = null,
  className = '',
}) {
  const max = rows.reduce((acc, row) => Math.max(acc, Number(row.value) || 0), 0);

  return (
    <section className={cx('rounded-2xl border border-ink-200 bg-white p-5 md:p-6', className)}>
      <header>
        <h2 className="font-display text-base font-bold text-ink-950">{title}</h2>
        {description && <p className="mt-1 text-[0.8125rem] text-ink-500">{description}</p>}
      </header>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-8 text-center text-sm text-ink-400">
          {emptyMessage}
        </p>
      ) : (
        <ul className="mt-5 space-y-3.5">
          {rows.map((row) => {
            // Percentage of the largest row, so the longest bar fills the track.
            const pct = max > 0 ? Math.max((Number(row.value) / max) * 100, row.value > 0 ? 2 : 0) : 0;
            const dot = STATUS_DOTS[row.tone] || null;

            return (
              <li key={row.key || row.label}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    {dot && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: dot }}
                        aria-hidden="true"
                      />
                    )}
                    {row.href ? (
                      <Link
                        href={row.href}
                        className="truncate text-[0.8125rem] font-medium text-ink-800 transition-colors hover:text-brand-700"
                        title={row.label}
                      >
                        {row.label}
                      </Link>
                    ) : (
                      <span className="truncate text-[0.8125rem] font-medium text-ink-800" title={row.label}>
                        {row.label}
                      </span>
                    )}
                  </span>

                  <span className="shrink-0 font-display text-[0.8125rem] font-bold tabular-nums text-ink-950">
                    {formatNumber(row.value)}
                    {valueSuffix}
                    {row.secondary && <span className="ml-1.5 font-normal text-ink-400">{row.secondary}</span>}
                  </span>
                </div>

                {/* track + bar: square at the baseline, 4px rounded at the data end */}
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-sm bg-ink-100">
                  <div
                    className="h-full bg-brand-500 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      width: `${pct}%`,
                      borderTopRightRadius: '4px',
                      borderBottomRightRadius: '4px',
                    }}
                    role="presentation"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {footer && <div className="mt-5 border-t border-ink-200 pt-4">{footer}</div>}
    </section>
  );
}

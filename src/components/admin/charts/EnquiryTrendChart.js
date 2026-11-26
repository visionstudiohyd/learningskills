'use client';

import { useMemo, useState } from 'react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Table2, TrendingUp } from 'lucide-react';
import { cx } from '@/lib/utils';

/**
 * Enquiries per day.
 *
 * One series, so there is no legend — the heading names what is plotted. Marks
 * follow the house spec: a 2px line, a 10%-opacity wash beneath it, hairline
 * solid gridlines, and axis text in ink tokens rather than the series colour.
 * A table view is available for anyone who needs the exact numbers.
 */

const BRAND = '#23085a';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 shadow-[var(--shadow-card)]">
      <p className="text-[0.6875rem] font-medium text-ink-500">{label}</p>
      <p className="mt-1 flex items-center gap-2 font-display text-base font-bold text-ink-950">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BRAND }} aria-hidden="true" />
        {value} {value === 1 ? 'enquiry' : 'enquiries'}
      </p>
    </div>
  );
}

export default function EnquiryTrendChart({ data = [], days = 30 }) {
  const [showTable, setShowTable] = useState(false);

  const { total, peak, average } = useMemo(() => {
    const sum = data.reduce((acc, d) => acc + d.enquiries, 0);
    const max = data.reduce((acc, d) => (d.enquiries > acc.enquiries ? d : acc), { enquiries: 0, label: '—' });
    return { total: sum, peak: max, average: data.length ? (sum / data.length).toFixed(1) : 0 };
  }, [data]);

  // Show every nth tick so labels never collide on a narrow card.
  const tickInterval = Math.max(Math.floor(data.length / 7), 0);

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-ink-950">Enquiries received</h2>
          <p className="mt-1 text-[0.8125rem] text-ink-500">
            Daily volume over the last {days} days · {total} total, {average} a day on average
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[0.6875rem] font-semibold text-brand-700 sm:inline-flex">
            <TrendingUp className="h-3 w-3" strokeWidth={2.6} />
            Peak {peak.enquiries} on {peak.label}
          </span>
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            aria-pressed={showTable}
            className={cx(
              'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.6875rem] font-semibold transition-colors',
              showTable
                ? 'border-brand-300 bg-brand-50 text-brand-700'
                : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
            )}
          >
            <Table2 className="h-3.5 w-3.5" strokeWidth={2.3} />
            {showTable ? 'Chart' : 'Table'}
          </button>
        </div>
      </header>

      {showTable ? (
        <div className="mt-5 max-h-72 overflow-y-auto rounded-xl border border-ink-200">
          <table className="w-full text-sm">
            <caption className="sr-only">Enquiries received per day over the last {days} days</caption>
            <thead className="sticky top-0 bg-ink-50">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-left font-display text-xs font-bold text-ink-700">
                  Date
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-display text-xs font-bold text-ink-700">
                  Enquiries
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200">
              {data.map((row) => (
                <tr key={row.date} className={row.enquiries > 0 ? '' : 'text-ink-400'}>
                  <td className="px-4 py-2">{row.label}</td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">{row.enquiries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5 h-64 w-full">
          {data.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-ink-400">No data to plot yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="enquiryWash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={0.16} />
                    <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#eef0f7" strokeWidth={1} vertical={false} />

                <XAxis
                  dataKey="label"
                  interval={tickInterval}
                  tick={{ fill: '#7b85a6', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#dde1ed' }}
                  dy={6}
                />
                <YAxis
                  allowDecimals={false}
                  width={46}
                  tick={{ fill: '#7b85a6', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: '#c2c8dc', strokeWidth: 1 }}
                />

                <Area
                  type="monotone"
                  dataKey="enquiries"
                  stroke={BRAND}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="url(#enquiryWash)"
                  dot={false}
                  activeDot={{ r: 4.5, fill: BRAND, stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </section>
  );
}

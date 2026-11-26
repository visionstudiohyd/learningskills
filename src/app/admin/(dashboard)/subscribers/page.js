import Link from 'next/link';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import { getSubscribers } from '@/lib/queries/leads';
import { cx, formatDate, plain } from '@/lib/utils';
import SubscriberActions from '@/components/admin/SubscriberActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Subscribers' };

export default async function SubscribersPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const result = await getSubscribers({ page: Number(sp.page) || 1, perPage: 30 });

  const pageHref = (page) => (page > 1 ? `/admin/subscribers?page=${page}` : '/admin/subscribers');
  const emails = result.items.map((s) => s.email).join(', ');

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-950">Newsletter subscribers</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            People who opted in through the footer form. Copy the list into your email tool to send a campaign.
          </p>
        </div>
        {result.items.length > 0 && <SubscriberActions emails={emails} count={result.items.length} />}
      </header>

      {result.items.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400">
            <Newspaper className="h-7 w-7" strokeWidth={1.8} />
          </span>
          <h3 className="mt-4 font-display text-base font-bold text-ink-900">No subscribers yet</h3>
          <p className="mt-2 max-w-sm text-sm text-ink-500">
            The signup form sits in the site footer. It can be switched off under Settings → Footer.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem]">
              <caption className="sr-only">Newsletter subscribers</caption>
              <thead className="border-b border-ink-200 bg-ink-50">
                <tr>
                  {['Email', 'Name', 'Subscribed', 'Status'].map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="px-4 py-3 text-left font-display text-[0.6875rem] font-bold uppercase tracking-wider text-ink-500"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200">
                {result.items.map((sub) => (
                  <tr key={sub.id} className="transition-colors hover:bg-ink-50/70">
                    <td className="px-4 py-3">
                      <a href={`mailto:${sub.email}`} className="text-sm font-medium text-brand-700 hover:underline">
                        {sub.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-700">{sub.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-ink-600">{formatDate(sub.created_at)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cx(
                          'inline-flex rounded-full px-2 py-0.5 text-[0.625rem] font-bold uppercase ring-1',
                          Number(sub.is_active) === 1
                            ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                            : 'bg-ink-100 text-ink-600 ring-ink-200'
                        )}
                      >
                        {Number(sub.is_active) === 1 ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-ink-200 px-4 py-3">
              <Link
                href={pageHref(result.page - 1)}
                aria-disabled={!result.hasPrev}
                className={cx('btn btn-outline btn-sm', !result.hasPrev && 'pointer-events-none opacity-40')}
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.4} />
                Previous
              </Link>
              <span className="text-xs text-ink-500">
                Page {result.page} of {result.totalPages}
              </span>
              <Link
                href={pageHref(result.page + 1)}
                aria-disabled={!result.hasNext}
                className={cx('btn btn-outline btn-sm', !result.hasNext && 'pointer-events-none opacity-40')}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
